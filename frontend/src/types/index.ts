export type Role = 'ADMIN' | 'STUDENT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  profileImage: string | null
  profileImageUrl?: string | null
  isVerified: boolean
  createdAt: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  _count?: {
    sections: number
    videos: number
  }
}

export interface Section {
  id: string
  courseId: string
  title: string
  order: number
  videos?: Video[]
}

export interface Video {
  id: string
  courseId: string
  sectionId: string | null
  title: string
  description: string | null
  duration: number | null
  thumbnail: string | null
  s3Key: string
  videoUrl: string | null
  thumbnailUrl?: string | null
  order: number
  allowDownload: boolean
  createdAt: string
  resources?: Resource[]
}

export interface CourseDetails extends Course {
  sections: Section[]
  videos: Video[]
}

export interface Resource {
  id: string
  videoId: string
  title: string
  fileUrl: string
  type: string
}

export interface Progress {
  id: string
  userId: string
  videoId: string
  lastTimestamp: number
  completed: boolean
  updatedAt: string
  video?: Video
  course?: Course
}

export interface Analytics {
  totalCourses: number
  totalVideos: number
  totalUsers: number
  totalViews: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface MessageAuthor {
  id: string
  name: string
  profileImage: string | null
  profileImageUrl?: string | null
  role: Role
}

export interface CommunityMessage {
  id: string
  content: string
  authorId: string
  parentId: string | null
  createdAt: string
  updatedAt: string
  author: MessageAuthor
  parent?: {
    id: string
    content: string
    author: { id: string; name: string }
  } | null
}

export interface VideoComment {
  id: string
  content: string
  videoId: string
  authorId: string
  createdAt: string
  updatedAt: string
  author: MessageAuthor
  video?: { id: string; title: string }
}

export interface CommunitySettings {
  enabled: boolean
}
