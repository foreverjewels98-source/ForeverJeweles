import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Order, OrderItem, ShippingAddress } from '@/lib/types/order';
import { formatWhatsAppOrderMessage } from '@/app/api/orders/route';

const ordersFilePath = path.join(process.cwd(), 'src', 'lib', 'orders-store.json');

function readOrdersFromFile(): Order[] {
  try {
    if (fs.existsSync(ordersFilePath)) {
      const data = fs.readFileSync(ordersFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error('Error reading orders file:', error);
  }
  return [];
}

function writeOrdersToFile(orders: Order[]): boolean {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing orders file:', error);
    return false;
  }
}

function getPayPalBaseUrl(): string {
  const env = process.env.PAYPAL_ENV || 'sandbox';
  return env === 'live' || env === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getAccessToken(): Promise<string> {
  const clientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal API credentials not configured in environment variables.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const baseUrl = getPayPalBaseUrl();

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error('Failed to authenticate with PayPal server.');
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, customer: providedCustomer, items: providedItems, currency, currencySymbol, total } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Check if this order was already processed and saved
    const existingOrders = readOrdersFromFile();
    const alreadyProcessed = existingOrders.find(
      (o) =>
        o.payment?.transactionId === orderId ||
        (o.payment as any)?.paypalOrderId === orderId
    );

    if (alreadyProcessed) {
      console.log(`[PayPal] Order for token ${orderId} already in store. Returning existing order.`);
      const clientPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919828930454';
      const message = formatWhatsAppOrderMessage(alreadyProcessed);
      const whatsAppUrl = `https://wa.me/${clientPhone}?text=${message}`;
      return NextResponse.json({
        success: true,
        order: alreadyProcessed,
        whatsAppUrl,
        alreadyCaptured: true,
      });
    }

    const token = await getAccessToken();
    const baseUrl = getPayPalBaseUrl();

    // Capture payment from PayPal
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });

    const captureData = await captureRes.json();

    // Check if already captured or completed
    const isAlreadyCaptured =
      captureData.name === 'ORDER_ALREADY_CAPTURED' ||
      (Array.isArray(captureData.details) &&
        captureData.details.some((d: any) => d.issue === 'ORDER_ALREADY_CAPTURED'));

    const isCompleted =
      captureData.status === 'COMPLETED' ||
      captureData.status === 'APPROVED' ||
      captureRes.ok;

    if (!isCompleted && !isAlreadyCaptured) {
      console.error('PayPal Capture Failed:', captureData);
      return NextResponse.json(
        { error: captureData.message || 'PayPal payment authorization failed.' },
        { status: 400 }
      );
    }

    // If order was already captured on PayPal, fetch order details to populate customer info
    let orderDetails = captureData;
    if (isAlreadyCaptured) {
      try {
        const getRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        if (getRes.ok) {
          orderDetails = await getRes.json();
        }
      } catch (e) {
        console.warn('Could not fetch existing PayPal order details:', e);
      }
    }

    // Extract transaction ID
    const captureObj = orderDetails.purchase_units?.[0]?.payments?.captures?.[0];
    const txnId = captureObj?.id || orderDetails.id || orderId;

    // Check if already saved in store under txnId
    const existingByTxn = existingOrders.find((o) => o.payment?.transactionId === txnId);
    if (existingByTxn) {
      console.log(`[PayPal] Order for txn ${txnId} already processed. Returning existing order.`);
      const clientPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919828930454';
      const message = formatWhatsAppOrderMessage(existingByTxn);
      const whatsAppUrl = `https://wa.me/${clientPhone}?text=${message}`;
      return NextResponse.json({
        success: true,
        order: existingByTxn,
        whatsAppUrl,
        alreadyCaptured: true,
      });
    }

    // Extract customer details from PayPal payer/shipping if needed
    const payer = orderDetails.payer || {};
    const shipping = orderDetails.purchase_units?.[0]?.shipping || {};
    const shippingAddr = shipping?.address || {};

    const finalCustomer: ShippingAddress = {
      firstName: (providedCustomer?.firstName || payer?.name?.given_name || 'Valued').trim(),
      lastName: (providedCustomer?.lastName || payer?.name?.surname || 'Customer').trim(),
      email: (providedCustomer?.email || payer?.email_address || 'client@paypal.com').trim(),
      phone: (providedCustomer?.phone || 'Verified via PayPal').trim(),
      streetAddress: (
        providedCustomer?.streetAddress ||
        shippingAddr?.address_line_1 ||
        'PayPal Verified Delivery Address'
      ).trim(),
      apartment: (providedCustomer?.apartment || shippingAddr?.address_line_2 || '').trim(),
      city: (providedCustomer?.city || shippingAddr?.admin_area_2 || 'Jaipur').trim(),
      state: (providedCustomer?.state || shippingAddr?.admin_area_1 || '').trim(),
      postalCode: (providedCustomer?.postalCode || shippingAddr?.postal_code || '00000').trim(),
      country: (providedCustomer?.country || shippingAddr?.country_code || 'United States').trim(),
    };

    const finalItems: OrderItem[] = Array.isArray(providedItems) && providedItems.length > 0
      ? providedItems.map((it: any) => {
          const unitPrice = Number(it.unitPrice ?? it.price ?? 50);
          const qty = Number(it.quantity || 1);
          return {
            productId: String(it.productId || it.product?.id || 'FJ-ITEM'),
            productName: String(it.productName || it.product?.name || 'Handcrafted Moissanite Ring'),
            productSlug: String(it.productSlug || it.product?.slug || ''),
            metal: String(it.metal || it.selectedMetal || 'Solid Gold / Silver'),
            size: String(it.size || it.selectedSize || 'US 7'),
            carat: it.carat || it.selectedCarat || it.product?.carat,
            engraving: it.engraving || it.engravingText,
            quantity: qty,
            unitPrice: unitPrice,
            totalPrice: Number(it.totalPrice ?? (unitPrice * qty)),
            image: it.image || it.product?.images?.[0] || '',
          };
        })
      : [
          {
            productId: 'FJ-CUSTOM',
            productName: 'Handcrafted Fine Moissanite Jewelry',
            productSlug: 'round-moissanite-leaf-engagement-ring-sterling-silver-vine-b-453438',
            metal: 'Solid Gold / Silver',
            size: 'US 7',
            quantity: 1,
            unitPrice: Number(total || 57),
            totalPrice: Number(total || 57),
            image: '',
          },
        ];

    const orderNumber = `FJ-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderNumber,
      customer: finalCustomer,
      items: finalItems,
      currency: currency || 'USD',
      currencySymbol: currencySymbol || '$',
      subtotal: Number(total || 57),
      shippingFee: 0,
      total: Number(total || 57),
      payment: {
        method: 'paypal',
        status: 'paid',
        transactionId: txnId,
      },
      orderStatus: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase Cloud Database (Prisma)
    try {
      const { prisma } = await import('@/lib/prisma');
      const phone = String(finalCustomer.phone || '9999999999').trim();
      const fullName = `${finalCustomer.firstName} ${finalCustomer.lastName}`.trim();
      const email = String(finalCustomer.email || '').trim();

      // Robust user lookup that avoids unique constraint collisions on phone/email
      let userId: string | null = null;
      try {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              ...(phone ? [{ phone }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
        });

        if (existingUser) {
          userId = existingUser.id;
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: fullName || existingUser.name,
              email: email || existingUser.email,
              phone: phone || existingUser.phone,
            },
          }).catch(() => {});
        } else {
          const newUser = await prisma.user.create({
            data: { phone, name: fullName, email: email || null },
          });
          userId = newUser.id;
        }
      } catch (userErr) {
        console.warn('PayPal user lookup warning:', userErr);
      }

      await prisma.order.create({
        data: {
          id: orderNumber,
          userId: userId,
          totalAmount: Number(total || 57),
          status: 'PROCESSING',
          paymentStatus: 'SUCCESS',
          paymentId: txnId || null,
          shippingAddress: finalCustomer as any,
          orderItemsJson: finalItems as any,
          currency: currency || 'USD',
          currencySymbol: currencySymbol || '$',
        },
      });
      console.log(`[Supabase] PayPal Order #${orderNumber} successfully saved to cloud database!`);
    } catch (dbErr) {
      console.error('[Supabase Save Error]:', dbErr);
    }

    // Save to backup store
    const orders = readOrdersFromFile();
    orders.unshift(newOrder);
    writeOrdersToFile(orders);

    // Generate WhatsApp link
    const clientPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919828930454';
    const message = formatWhatsAppOrderMessage(newOrder);
    const whatsAppUrl = `https://wa.me/${clientPhone}?text=${message}`;

    // Dispatch email notifications (customer + store owner)
    try {
      const { sendOrderNotifications } = await import('@/lib/notifications');
      const forwardedHost = req.headers.get('x-forwarded-host');
      const host = forwardedHost || req.headers.get('host');
      const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
      const origin = host
        ? `${proto}://${host}`
        : (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
            ? process.env.NEXT_PUBLIC_SITE_URL
            : new URL(req.url).origin);

      await sendOrderNotifications({ order: newOrder, siteUrl: origin });
    } catch (notifErr) {
      console.warn('Failed to dispatch PayPal notifications:', notifErr);
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      whatsAppUrl,
    });
  } catch (error: any) {
    console.error('Server PayPal Capture Order Exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error capturing PayPal order.' },
      { status: 500 }
    );
  }
}
