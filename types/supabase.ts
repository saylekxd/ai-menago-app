export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          created_at: string
          due_date: string
          completed: boolean
          assigned_to: string | null
          created_by: string
          requires_photo: boolean
          verification_photo_url: string | null
          completed_at: string | null
          business_id: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          created_at?: string
          due_date: string
          completed?: boolean
          assigned_to?: string | null
          created_by: string
          requires_photo?: boolean
          verification_photo_url?: string | null
          completed_at?: string | null
          business_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          created_at?: string
          due_date?: string
          completed?: boolean
          assigned_to?: string | null
          created_by?: string
          requires_photo?: boolean
          verification_photo_url?: string | null
          completed_at?: string | null
          business_id?: string
        }
      }
      task_assignments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          assigned_at: string
          completed: boolean
          completed_at: string | null
          verification_photo_url: string | null
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          assigned_at?: string
          completed?: boolean
          completed_at?: string | null
          verification_photo_url?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          assigned_at?: string
          completed?: boolean
          completed_at?: string | null
          verification_photo_url?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'worker'
          business_id: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'worker'
          business_id: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'manager' | 'worker'
          business_id?: string
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          industry: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          industry: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry?: string
          created_at?: string
        }
      }
      task_performance: {
        Row: {
          id: string
          user_id: string
          completed_tasks: number
          pending_tasks: number
          overdue_tasks: number
          week_number: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed_tasks: number
          pending_tasks: number
          overdue_tasks: number
          week_number: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed_tasks?: number
          pending_tasks?: number
          overdue_tasks?: number
          week_number?: number
          year?: number
          created_at?: string
        }
      }
    }
  }
}