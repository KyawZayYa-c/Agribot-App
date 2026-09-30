const PROXY_URL = 'https://gemini-proxy-server-0ekj.onrender.com/api/gemini-proxy';
const HEALTH_URL = 'https://gemini-proxy-server-0ekj.onrender.com/health';

export const checkGeminiHealth = async () => {
  try {
    console.log('🔍 Checking Gemini server health...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`❌ Health check failed: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    const isHealthy = data?.status === 'ok';
    console.log(`📊 Health check: ${isHealthy ? '✅ OK' : '❌ Failed'}`);
    return isHealthy;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Health check timeout (server may be waking up)');
    } else {
      console.error('❌ Health check error:', error.message);
    }
    return false;
  }
};

export const callGeminiProxy = async (message, feature = 'general', sessionId = null) => {
  try {
    console.log(`📤 Sending to Gemini Proxy: ${message.substring(0, 50)}...`);
    
    // ✅ Set timeout to 60 seconds (more time for AI response)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        feature: feature || 'general',
        sessionId: sessionId,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('❌ Server response error:', response.status);
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = errorData?.reply || errorData?.error || '';
      } catch {
        errorText = await response.text();
      }
      console.error('❌ Error details:', errorText);
      
      // ✅ Return user-friendly message instead of throwing
      return {
        success: false,
        reply: 'AI ဆာဗာမှ အမှားတစ်ခုဖြစ်နေပါသည်။ ခဏနေပြီး ပြန်ကြိုးစားပါ။',
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }
    
    const data = await response.json();
    console.log('📥 Gemini Proxy response received');
    
    if (data && data.success) {
      return {
        success: true,
        reply: data.reply || 'အဖြေမရရှိပါ',
        feature: data.feature || feature,
        sessionId: data.sessionId || sessionId,
      };
    } else {
      return {
        success: false,
        reply: data?.reply || 'AI မှ အဖြေမရရှိပါ',
        error: data?.error || 'No reply from AI',
      };
    }
  } catch (error) {
    // ✅ Handle timeout gracefully - NO ERROR THROWN
    if (error.name === 'AbortError') {
      console.log('⏰ Request timeout (AI took too long)');
      return {
        success: false,
        reply: 'AI က အချိန်အကြာကြီးယူနေပါသည်။ ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။',
        error: 'Timeout',
      };
    }
    
    // ✅ Handle network errors gracefully
    if (error.message === 'Failed to fetch' || error.message.includes('Network')) {
      console.error('🌐 Network error - Server may be waking up');
      return {
        success: false,
        reply: 'AI ဆာဗာကို ချိတ်ဆက်လို့မရပါ။ ဆာဗာက နိုးနေအောင် စောင့်ဆိုင်းနေပါသည်။ ခဏနေပြီး ပြန်ကြိုးစားပါ။',
        error: 'Network error',
      };
    }
    
    console.error('❌ Gemini Proxy error:', error.message);
    return {
      success: false,
      reply: 'AI ဝန်ဆောင်မှုကို ချိတ်ဆက်လို့မရပါ။ ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။',
      error: error.message,
    };
  }
};

export const sendMessageWithRetry = async (message, feature = 'general', sessionId = null, maxRetries = 2) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Attempt ${attempt}/${maxRetries}...`);
    
    const result = await callGeminiProxy(message, feature, sessionId);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    if (lastError === 'Timeout' || lastError === 'Network error') {
      console.log(`⏹️ Stopping retry due to ${lastError}`);
      break;
    }
    
    if (attempt < maxRetries) {
      const delay = attempt * 2000;
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return {
    success: false,
    reply: 'AI ဝန်ဆောင်မှုကို အကြိမ်ကြိမ် ချိတ်ဆက်လို့မရပါ။ ကျေးဇူးပြု၍ နောက်မှထပ်ကြိုးစားပါ။',
    error: lastError,
  };
};