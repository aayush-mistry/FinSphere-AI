export async function* streamSimulatedResponse(content: string, chunkSize: number = 3, delayMs: number = 20) {
  let currentIndex = 0;

  // Add an initial brief delay to simulate "thinking"
  await new Promise(resolve => setTimeout(resolve, 800));

  while (currentIndex < content.length) {
    const chunk = content.slice(currentIndex, currentIndex + chunkSize);
    yield chunk;
    currentIndex += chunkSize;
    
    // Simulate natural typing rhythm
    const jitter = Math.floor(Math.random() * delayMs);
    await new Promise(resolve => setTimeout(resolve, delayMs + jitter));
  }
}
