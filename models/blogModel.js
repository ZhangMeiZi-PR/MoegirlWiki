



// Schema and Model create
const blogSchema = ({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  details: {
    author: {
      type: String,
    },
    avatar: {
      type: String,
    }
  }
}, { timestamps: true });

