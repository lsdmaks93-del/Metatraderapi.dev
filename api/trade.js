export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get everything from the request body
  const { 
    api_key,      // User's MetaTrader API key
    account_uuid, // User's MetaTrader account UUID
    symbol, 
    action,       // 'buy' or 'sell'
    volume,
    stopLoss,
    takeProfit 
  } = req.body;

  // Validate all required fields
  if (!api_key) {
    return res.status(400).json({ error: 'API key is required' });
  }
  if (!account_uuid) {
    return res.status(400).json({ error: 'Account UUID is required' });
  }
  if (!symbol || !action || !volume) {
    return res.status(400).json({ error: 'Trade parameters missing' });
  }

  // Convert action to MetaTrader format (adjust based on their API docs)
  const orderType = action.toLowerCase() === 'buy' ? 0 : 1;

  // Prepare payload for metatraderapi.dev
  const payload = {
    api_key: api_key,
    account_uuid: account_uuid,
    symbol: symbol.toUpperCase(),
    type: orderType,
    volume: parseFloat(volume),
  };

  // Add TP/SL if provided
  if (stopLoss) payload.stop_loss = parseFloat(stopLoss);
  if (takeProfit) payload.take_profit = parseFloat(takeProfit);

  try {
    // Call metatraderapi.dev - REPLACE WITH THEIR ACTUAL ENDPOINT
    const response = await fetch('https://metatraderapi.dev/v1/trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Trade execution failed');
    }

    // Send success back to Lovable
    res.status(200).json({ 
      success: true, 
      tradeId: data.tradeId,
      message: 'Trade executed successfully' 
    });

  } catch (error) {
    console.error('Trade error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}