const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  htmlCode: {
    type: String,
    default: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <!-- Your HTML here -->
</body>
</html>`
  },
  cssCode: {
    type: String,
    default: `/* Your CSS here */`
  },
  jsCode: {
    type: String,
    default: `// Your JavaScript here`
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ createdBy: 1, date: -1 });

module.exports = mongoose.model('Project', projectSchema);
