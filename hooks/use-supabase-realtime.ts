import { useEffect } from 'react'
import { supabase } from "@/utils/supabase/client"

type TableName = 
  | 'patients'
  | 'appointments'
  | 'staff'
  | 'medical_records'
  | 'inventory'
  | 'billing'
  | 'departments'
  | 'rooms'

export function useSupabaseRealtime(
  tableName: TableName, 
  onChangeCallback: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase.channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          console.log(`${tableName} change received:`, payload)
          onChangeCallback(payload)
        }
      )
      .subscribe()
    
    // Cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName, onChangeCallback])
}