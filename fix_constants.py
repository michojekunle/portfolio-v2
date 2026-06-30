with open('/Users/mac/prog/blockchain/portfolio-v2/lib/bookbreaks/constants.tsx', 'r') as f:
    content = f.read()

import_statement = 'import { FileText, MessageSquare, Images, Video, Hash } from "lucide-react";\nimport React from "react";\n'
content = import_statement + content

content = content.replace(
    'export const CONTENT_TYPE_ICONS: Record<string, string> = {',
    'export const CONTENT_TYPE_ICONS: Record<string, React.ReactElement> = {'
)
content = content.replace('article: "📝",', 'article: <FileText size={16} />,\n')
content = content.replace('thread: "🐦",', 'thread: <MessageSquare size={16} />,\n')
content = content.replace('carousel: "📸",', 'carousel: <Images size={16} />,\n')
content = content.replace('tiktok: "🎬",', 'tiktok: <Video size={16} />,\n')
content = content.replace('caption: "💬",', 'caption: <Hash size={16} />,\n')

with open('/Users/mac/prog/blockchain/portfolio-v2/lib/bookbreaks/constants.tsx', 'w') as f:
    f.write(content)

