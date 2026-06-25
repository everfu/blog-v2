import type { CommentFormState, EmojiPack } from './types'

export const emptyCommentForm: CommentFormState = {
  authorName: '',
  email: '',
  website: '',
  body: '',
}

export const defaultEmojiPacks: EmojiPack[] = [
  {
    默认: {
      type: 'emoji',
      container: [
        { text: '', icon: '🙂' },
        { text: '', icon: '✨' },
        { text: '', icon: '❤️' },
      ],
    },
  },
]
