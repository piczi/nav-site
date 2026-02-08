async function testFaviconRedirect() {
  const domain = "qq.com";
  
  console.log("测试 favicon 重定向...");
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const testUrl = `https://${domain}/favicon.ico`
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FaviconFetcher/1.0)',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    
    clearTimeout(timeout);
    
    console.log("请求 URL:", testUrl);
    console.log("响应 URL:", response.url);
    console.log("响应状态:", response.status);
    console.log("响应头:", Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log("✅ 成功获取 favicon");
    } else {
      console.log("❌ 获取失败");
    }
  } catch (error) {
    console.error("❌ 请求失败:", error);
  }
}

testFaviconRedirect();