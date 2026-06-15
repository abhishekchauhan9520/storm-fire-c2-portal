const fs = require('fs');
const path = require('path');

// Target transcript file from absolute system path
const transcriptPath = '/.gemini/antigravity/brain/52d35866-5680-49f6-b972-3c9852f632a7/.system_generated/logs/transcript.jsonl';

try {
  if (fs.existsSync(transcriptPath)) {
    console.log("Transcript found!");
    const stats = fs.statSync(transcriptPath);
    console.log("File size in bytes:", stats.size);
    
    // Read the last 200,000 characters which should contain previous messages and edits
    const fd = fs.openSync(transcriptPath, 'r');
    const bufferSize = Math.min(250000, stats.size);
    const buffer = Buffer.alloc(bufferSize);
    fs.readSync(fd, buffer, 0, bufferSize, stats.size - bufferSize);
    fs.closeSync(fd);
    
    const tailStr = buffer.toString('utf8');
    
    // Let's search inside the log string for pieces of the file IndraNetBrain2035.tsx
    const searchIdx = tailStr.lastIndexOf('export default function IndraNetBrain2035');
    if (searchIdx !== -1) {
      console.log("Found IndraNetBrain2035 inside the transcript logs at index", searchIdx);
      // Let's write the chunk out to a temp file
      fs.writeFileSync('extracted_log.txt', tailStr.substring(searchIdx), 'utf8');
      console.log("EXTRACTED to extracted_log.txt!");
    } else {
      console.log("Could not find the component export statement in the tail of the log.");
      // Just write the last 50,000 characters to inspect
      fs.writeFileSync('tail_log.txt', tailStr.substring(tailStr.length - 50000), 'utf8');
    }
  } else {
    console.log("Transcript path does not exist on this container disk map.");
  }
} catch (e) {
  console.error("Failed to read transcript file:", e.message);
}
