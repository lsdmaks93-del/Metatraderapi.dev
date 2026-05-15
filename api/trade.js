export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    api_key, account_uuid, symbol, action, 
    volume, stopLoss, takeProfit 
  } = req.body;

  if (!api_key || !account_uuid || !symbol || !action || !volume) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orderType = action.toLowerCase() === 'buy' ? 0 : 1;

  const payload = {
    api_key: api_key,
    account_uuid: account_uuid,
    symbol: symbol.toUpperCase(),
    type: orderType,
    volume: parseFloat(volume),
  };

  if (stopLoss) payload.stop_loss = parseFloat(stopLoss);
  if (takeProfit) payload.take_profit = parseFloat(takeProfit);

  try {
    const response = await fetch('https://metatraderapi.dev/v1/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Trade failed');
    }

    res.status(200).json({ 
      success: true, 
      tradeId: data.tradeId,
      message: 'Trade executed successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
