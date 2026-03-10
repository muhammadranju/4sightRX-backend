require('dotenv').config();
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY)
  .then(r => r.json())
  .then(d => {
    if (d.models) {
      console.log(d.models.map(m => m.name).join('\n'));
    } else {
      console.log('Error:', d);
    }
  });
