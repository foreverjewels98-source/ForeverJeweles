import { NextResponse } from 'next/server';

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
    const errText = await res.text();
    console.error('PayPal OAuth Token Error:', errText);
    throw new Error('Failed to authenticate with PayPal server.');
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, items } = body;

    const token = await getAccessToken();
    const baseUrl = getPayPalBaseUrl();

    // Determine real public origin for PayPal return/cancel URLs (prevents mobile localhost redirect hangs)
    const forwardedHost = req.headers.get('x-forwarded-host');
    const host = forwardedHost || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const origin = host
      ? `${proto}://${host}`
      : (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
          ? process.env.NEXT_PUBLIC_SITE_URL
          : new URL(req.url).origin);

    // PayPal supported currencies (INR is not supported for standard PayPal checkout in India)
    const PAYPAL_ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'NZD', 'CHF', 'HKD'];
    let validCurrency = (currency || 'USD').toUpperCase();
    let numAmount = Number(amount || 1);

    if (!PAYPAL_ALLOWED_CURRENCIES.includes(validCurrency)) {
      numAmount = Math.max(1, Math.round(numAmount / 86.5));
      validCurrency = 'USD';
    }

    const formattedAmount = numAmount.toFixed(2);

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `FJ-${Date.now()}`,
          description: `ForeverJewellStudio - Handcrafted Fine Jewelry Order (${items?.length || 1} items)`,
          amount: {
            currency_code: validCurrency,
            value: formattedAmount,
          },
        },
      ],
      application_context: {
        brand_name: 'Forever Jewell Studio',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'GET_FROM_FILE',
        return_url: `${origin}/checkout?status=paypal_success`,
        cancel_url: `${origin}/checkout?status=paypal_cancelled`,
      },
    };

    const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });

    const orderData = await res.json();

    if (!res.ok || !orderData.id) {
      console.error('PayPal Create Order API Error:', orderData);
      return NextResponse.json(
        { error: orderData.message || 'Failed to create PayPal order.' },
        { status: 400 }
      );
    }

    const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      approveUrl: approveLink,
    });
  } catch (error: any) {
    console.error('Server PayPal Create Order Exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error creating PayPal checkout session.' },
      { status: 500 }
    );
  }
}
