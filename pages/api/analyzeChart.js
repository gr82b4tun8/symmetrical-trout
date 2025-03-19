// pages/api/analyzeChart.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add extensive debugging of environment
  console.log('=== Environment Debugging ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Has OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
  if (process.env.OPENAI_API_KEY) {
    console.log('API Key Length:', process.env.OPENAI_API_KEY.length);
    console.log('API Key Prefix:', process.env.OPENAI_API_KEY.substring(0, 3));
  }
  console.log('=== End Environment Debug ===');

  try {
    const { image, symbol, date } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    // Get the API key with fallback options for testing
    let apiKey = process.env.OPENAI_API_KEY;
    
    // Check if API key is available
    if (!apiKey) {
      console.error('⚠️ OpenAI API key is missing from process.env');
      
      // Option 1: You can uncomment this line to hard-code the key for testing
      // apiKey = "sk-your-actual-api-key-here";
      
      // If you decide not to use a fallback, return an error
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'OpenAI API key configuration error',
          details: 'The API key is missing from environment variables. Check your .env.local file and server configuration.'
        });
      }
    }

    // Convert base64 data URL to binary for the OpenAI API
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    
    // Add debug logging for image data
    console.log('Image data format check:', {
      startsWithData: image.startsWith('data:'),
      length: image.length,
      sampleStart: image.substring(0, 30) + '...'
    });

    // Initialize the OpenAI API client with explicit API key
    console.log('Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('Sending request to OpenAI...');
    
    // Updated prompt with structured sections for options analysis
    const structuredPrompt = `Based on this chart image of ${symbol} for ${date}, please analyze and provide:

1. OPTION TYPE: Recommend whether this setup indicates a call or put position.

2. STRIKE PRICE: Suggest the optimal strike price based on the technical setup.

3. ENTRY PRICE: Specify the ideal entry price or range for this options contract.

4. EXIT STRATEGY: Define both a profit target price and stop-loss level.

5. RATIONALE: Explain the technical setup or pattern visible in the chart that justifies this trade.

Please organize your response in these five clearly labeled sections.`;

    // Determine the correct image type (JPEG or PNG)
    const imageType = image.includes('data:image/png') ? 'png' : 'jpeg';
    const imageUrl = base64Data.startsWith('data:') 
      ? base64Data 
      : `data:image/${imageType};base64,${base64Data}`;
    
    console.log(`Using image type: ${imageType}`);
    console.log(`Image URL starts with: ${imageUrl.substring(0, 30)}...`);

    // Send to ChatGPT with vision capabilities
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Current vision-capable model
      messages: [
        {
          role: "system",
          content: "You are a specialized options trading analyst. You can see and analyze stock charts to provide specific options trading recommendations."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: structuredPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high" // Request high detail analysis
              }
            }
          ]
        }
      ],
      max_tokens: 600,
    });

    console.log('Response received from OpenAI');

    // Return the analysis
    return res.status(200).json({
      analysis: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error analyzing chart:', error);
    console.error('Error details:', error.stack);
    
    // Return detailed error information
    return res.status(500).json({
      error: 'Failed to analyze chart: ' + (error.message || 'Unknown error'),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: error.constructor.name
    });
  }
}