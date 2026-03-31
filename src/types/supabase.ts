export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_cognitive_metrics: {
        Row: {
          agent_id: string
          category: Database["public"]["Enums"]["metric_category_enum"]
          id: string
          metric_name: string
          metric_value: number
          recorded_at: string | null
          run_id: string | null
        }
        Insert: {
          agent_id: string
          category: Database["public"]["Enums"]["metric_category_enum"]
          id?: string
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          run_id?: string | null
        }
        Update: {
          agent_id?: string
          category?: Database["public"]["Enums"]["metric_category_enum"]
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_cognitive_metrics_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_executions: {
        Row: {
          agent_id: string
          artifacts_count: number | null
          completed_at: string | null
          cost_usd: number | null
          created_at: string | null
          decisions: Json | null
          duration_ms: number | null
          errors: Json | null
          id: string
          metadata: Json | null
          model: string | null
          run_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["run_status_enum"] | null
          tokens_input: number | null
          tokens_output: number | null
          wave: number
        }
        Insert: {
          agent_id: string
          artifacts_count?: number | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          decisions?: Json | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          model?: string | null
          run_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status_enum"] | null
          tokens_input?: number | null
          tokens_output?: number | null
          wave: number
        }
        Update: {
          agent_id?: string
          artifacts_count?: number | null
          completed_at?: string | null
          cost_usd?: number | null
          created_at?: string | null
          decisions?: Json | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          model?: string | null
          run_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status_enum"] | null
          tokens_input?: number | null
          tokens_output?: number | null
          wave?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_learning_profiles: {
        Row: {
          agent_id: string
          avg_cost_usd: number | null
          avg_duration_seconds: number | null
          circuit_breaker_status: string | null
          created_at: string | null
          id: string
          improvement_areas: string[] | null
          last_execution_at: string | null
          status: string | null
          strengths: string[] | null
          success_rate: number | null
          total_executions: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          avg_cost_usd?: number | null
          avg_duration_seconds?: number | null
          circuit_breaker_status?: string | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          last_execution_at?: string | null
          status?: string | null
          strengths?: string[] | null
          success_rate?: number | null
          total_executions?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          avg_cost_usd?: number | null
          avg_duration_seconds?: number | null
          circuit_breaker_status?: string | null
          created_at?: string | null
          id?: string
          improvement_areas?: string[] | null
          last_execution_at?: string | null
          status?: string | null
          strengths?: string[] | null
          success_rate?: number | null
          total_executions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_skills: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          os_layer: string | null
          proficiency: number | null
          skill_name: string
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          os_layer?: string | null
          proficiency?: number | null
          skill_name: string
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          os_layer?: string | null
          proficiency?: number | null
          skill_name?: string
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_traces: {
        Row: {
          agent_id: string
          content: Json
          created_at: string | null
          duration_ms: number | null
          execution_id: string | null
          id: string
          run_id: string | null
          trace_type: string
          wave_number: number | null
        }
        Insert: {
          agent_id: string
          content: Json
          created_at?: string | null
          duration_ms?: number | null
          execution_id?: string | null
          id?: string
          run_id?: string | null
          trace_type: string
          wave_number?: number | null
        }
        Update: {
          agent_id?: string
          content?: Json
          created_at?: string | null
          duration_ms?: number | null
          execution_id?: string | null
          id?: string
          run_id?: string | null
          trace_type?: string
          wave_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_traces_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "agent_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_id: string
          avg_cost_usd: number | null
          avg_duration_seconds: number | null
          circuit_breaker_status: string | null
          cmi_score: number | null
          created_at: string | null
          description: string | null
          human_name: string | null
          id: string
          model: string | null
          name: string
          specialization: string | null
          status: Database["public"]["Enums"]["agent_status_enum"] | null
          success_rate: number | null
          total_executions: number | null
          updated_at: string | null
          wave: number
        }
        Insert: {
          agent_id: string
          avg_cost_usd?: number | null
          avg_duration_seconds?: number | null
          circuit_breaker_status?: string | null
          cmi_score?: number | null
          created_at?: string | null
          description?: string | null
          human_name?: string | null
          id?: string
          model?: string | null
          name: string
          specialization?: string | null
          status?: Database["public"]["Enums"]["agent_status_enum"] | null
          success_rate?: number | null
          total_executions?: number | null
          updated_at?: string | null
          wave: number
        }
        Update: {
          agent_id?: string
          avg_cost_usd?: number | null
          avg_duration_seconds?: number | null
          circuit_breaker_status?: string | null
          cmi_score?: number | null
          created_at?: string | null
          description?: string | null
          human_name?: string | null
          id?: string
          model?: string | null
          name?: string
          specialization?: string | null
          status?: Database["public"]["Enums"]["agent_status_enum"] | null
          success_rate?: number | null
          total_executions?: number | null
          updated_at?: string | null
          wave?: number
        }
        Relationships: []
      }
      alert_rules: {
        Row: {
          condition: Json
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          notify_channels: string[] | null
          severity: Database["public"]["Enums"]["alert_severity_enum"] | null
          updated_at: string | null
        }
        Insert: {
          condition?: Json
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          notify_channels?: string[] | null
          severity?: Database["public"]["Enums"]["alert_severity_enum"] | null
          updated_at?: string | null
        }
        Update: {
          condition?: Json
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          notify_channels?: string[] | null
          severity?: Database["public"]["Enums"]["alert_severity_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          agent_id: string | null
          created_at: string | null
          description: string | null
          id: string
          resolved_at: string | null
          run_id: string | null
          severity: Database["public"]["Enums"]["alert_severity_enum"] | null
          source: string | null
          status: Database["public"]["Enums"]["alert_status_enum"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          run_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_enum"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["alert_status_enum"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          run_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity_enum"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["alert_status_enum"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action_enum"]
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action_enum"]
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      constraints: {
        Row: {
          constraint_id: string | null
          created_at: string | null
          description: string | null
          enforcement: string | null
          id: string
          name: string
          severity: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          constraint_id?: string | null
          created_at?: string | null
          description?: string | null
          enforcement?: string | null
          id?: string
          name: string
          severity?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          constraint_id?: string | null
          created_at?: string | null
          description?: string | null
          enforcement?: string | null
          id?: string
          name?: string
          severity?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contract_addendums: {
        Row: {
          contract_id: string
          created_at: string
          description: string | null
          id: string
          new_end_date: string | null
          number: string
          signed_at: string | null
          value_change: number | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          description?: string | null
          id?: string
          new_end_date?: string | null
          number: string
          signed_at?: string | null
          value_change?: number | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          description?: string | null
          id?: string
          new_end_date?: string | null
          number?: string
          signed_at?: string | null
          value_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_addendums_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_documents: {
        Row: {
          contract_id: string
          file_url: string
          id: string
          name: string
          uploaded_at: string
        }
        Insert: {
          contract_id: string
          file_url: string
          id?: string
          name: string
          uploaded_at?: string
        }
        Update: {
          contract_id?: string
          file_url?: string
          id?: string
          name?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_type: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          file_url: string | null
          id: string
          number: string
          organ: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status_enum"]
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          file_url?: string | null
          id?: string
          number: string
          organ: string
          start_date: string
          status?: Database["public"]["Enums"]["contract_status_enum"]
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          file_url?: string | null
          id?: string
          number?: string
          organ?: string
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status_enum"]
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      cross_project_knowledge: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          evidence_count: number | null
          example_context: Json | null
          id: string
          last_used_at: string | null
          pattern: string
          source_agent: string | null
          source_run_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          evidence_count?: number | null
          example_context?: Json | null
          id?: string
          last_used_at?: string | null
          pattern: string
          source_agent?: string | null
          source_run_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          evidence_count?: number | null
          example_context?: Json | null
          id?: string
          last_used_at?: string | null
          pattern?: string
          source_agent?: string | null
          source_run_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_project_knowledge_source_run_id_fkey"
            columns: ["source_run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          ativo: boolean
          cargo: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          slack_id: string | null
          telefone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          slack_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          slack_id?: string | null
          telefone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      factory_checkpoints: {
        Row: {
          artifacts_snapshot: Json | null
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          id: string
          output_summary: string | null
          run_id: string | null
          started_at: string | null
          state: Json | null
          status: string
          wave_number: number
        }
        Insert: {
          artifacts_snapshot?: Json | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          output_summary?: string | null
          run_id?: string | null
          started_at?: string | null
          state?: Json | null
          status: string
          wave_number: number
        }
        Update: {
          artifacts_snapshot?: Json | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          output_summary?: string | null
          run_id?: string | null
          started_at?: string | null
          state?: Json | null
          status?: string
          wave_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "factory_checkpoints_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      factory_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      factory_metrics: {
        Row: {
          agent_id: string | null
          id: string
          labels: Json | null
          metric_name: string
          metric_type: string | null
          metric_value: number
          recorded_at: string | null
          run_id: string | null
          wave: number | null
        }
        Insert: {
          agent_id?: string | null
          id?: string
          labels?: Json | null
          metric_name: string
          metric_type?: string | null
          metric_value: number
          recorded_at?: string | null
          run_id?: string | null
          wave?: number | null
        }
        Update: {
          agent_id?: string | null
          id?: string
          labels?: Json | null
          metric_name?: string
          metric_type?: string | null
          metric_value?: number
          recorded_at?: string | null
          run_id?: string | null
          wave?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "factory_metrics_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      factory_runs: {
        Row: {
          completed_at: string | null
          completed_waves: number | null
          config: Json | null
          created_at: string | null
          current_wave: number | null
          error_message: string | null
          id: string
          name: string
          quality_score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["run_status_enum"] | null
          template: string | null
          total_cost_usd: number | null
          total_duration_ms: number | null
          total_tokens_input: number | null
          total_tokens_output: number | null
          total_waves: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_waves?: number | null
          config?: Json | null
          created_at?: string | null
          current_wave?: number | null
          error_message?: string | null
          id?: string
          name: string
          quality_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status_enum"] | null
          template?: string | null
          total_cost_usd?: number | null
          total_duration_ms?: number | null
          total_tokens_input?: number | null
          total_tokens_output?: number | null
          total_waves?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_waves?: number | null
          config?: Json | null
          created_at?: string | null
          current_wave?: number | null
          error_message?: string | null
          id?: string
          name?: string
          quality_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["run_status_enum"] | null
          template?: string | null
          total_cost_usd?: number | null
          total_duration_ms?: number | null
          total_tokens_input?: number | null
          total_tokens_output?: number | null
          total_waves?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      key_results: {
        Row: {
          created_at: string
          current_value: number
          description: string | null
          due_date: string | null
          id: string
          metric_type: Database["public"]["Enums"]["kr_metric_type_enum"]
          objective_id: string
          owner: string | null
          status: Database["public"]["Enums"]["okr_status_enum"]
          target_value: number
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number
          description?: string | null
          due_date?: string | null
          id?: string
          metric_type?: Database["public"]["Enums"]["kr_metric_type_enum"]
          objective_id: string
          owner?: string | null
          status?: Database["public"]["Enums"]["okr_status_enum"]
          target_value?: number
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number
          description?: string | null
          due_date?: string | null
          id?: string
          metric_type?: Database["public"]["Enums"]["kr_metric_type_enum"]
          objective_id?: string
          owner?: string | null
          status?: Database["public"]["Enums"]["okr_status_enum"]
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      kr_checkins: {
        Row: {
          checked_by: string | null
          created_at: string
          id: string
          key_result_id: string
          notes: string | null
          value: number
        }
        Insert: {
          checked_by?: string | null
          created_at?: string
          id?: string
          key_result_id: string
          notes?: string | null
          value: number
        }
        Update: {
          checked_by?: string | null
          created_at?: string
          id?: string
          key_result_id?: string
          notes?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kr_checkins_key_result_id_fkey"
            columns: ["key_result_id"]
            isOneToOne: false
            referencedRelation: "key_results"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons_learned: {
        Row: {
          agent_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          lesson_id: string | null
          resolution: string | null
          run_id: string | null
          severity: string | null
          status: Database["public"]["Enums"]["lesson_status_enum"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          resolution?: string | null
          run_id?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["lesson_status_enum"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          resolution?: string | null
          run_id?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["lesson_status_enum"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_learned_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string
          id: string
          owner: string | null
          pillar: string
          progress: number
          quarter: string
          status: Database["public"]["Enums"]["okr_status_enum"]
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          owner?: string | null
          pillar?: string
          progress?: number
          quarter?: string
          status?: Database["public"]["Enums"]["okr_status_enum"]
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          owner?: string | null
          pillar?: string
          progress?: number
          quarter?: string
          status?: Database["public"]["Enums"]["okr_status_enum"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role_enum"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quality_reports: {
        Row: {
          auto_fixes: Json | null
          created_at: string | null
          gates: Json | null
          id: string
          issues: Json | null
          overall_score: number | null
          recommendation: string | null
          run_id: string | null
        }
        Insert: {
          auto_fixes?: Json | null
          created_at?: string | null
          gates?: Json | null
          id?: string
          issues?: Json | null
          overall_score?: number | null
          recommendation?: string | null
          run_id?: string | null
        }
        Update: {
          auto_fixes?: Json | null
          created_at?: string | null
          gates?: Json | null
          id?: string
          issues?: Json | null
          overall_score?: number | null
          recommendation?: string | null
          run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_reports_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index?: number
          question_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          required: boolean | null
          settings: Json | null
          survey_id: string
          text: string
          type: Database["public"]["Enums"]["question_type_enum"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          required?: boolean | null
          settings?: Json | null
          survey_id: string
          text: string
          type: Database["public"]["Enums"]["question_type_enum"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          required?: boolean | null
          settings?: Json | null
          survey_id?: string
          text?: string
          type?: Database["public"]["Enums"]["question_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      response_answers: {
        Row: {
          answer_numeric: number | null
          answer_options: string[] | null
          answer_text: string | null
          created_at: string | null
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          answer_numeric?: number | null
          answer_options?: string[] | null
          answer_text?: string | null
          created_at?: string | null
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          answer_numeric?: number | null
          answer_options?: string[] | null
          answer_text?: string | null
          created_at?: string | null
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          completed_at: string | null
          id: string
          metadata: Json | null
          respondent_email: string | null
          respondent_id: string | null
          respondent_name: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["response_status_enum"] | null
          survey_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          metadata?: Json | null
          respondent_email?: string | null
          respondent_id?: string | null
          respondent_name?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["response_status_enum"] | null
          survey_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          metadata?: Json | null
          respondent_email?: string | null
          respondent_id?: string | null
          respondent_name?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["response_status_enum"] | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_invitations: {
        Row: {
          created_at: string | null
          email: string
          employee_id: string | null
          id: string
          name: string | null
          responded_at: string | null
          sent_at: string | null
          slack_id: string | null
          status: string
          survey_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          employee_id?: string | null
          id?: string
          name?: string | null
          responded_at?: string | null
          sent_at?: string | null
          slack_id?: string | null
          status?: string
          survey_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          employee_id?: string | null
          id?: string
          name?: string | null
          responded_at?: string | null
          sent_at?: string | null
          slack_id?: string | null
          status?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_invitations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_invitations_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          anonymous: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          max_responses: number | null
          response_count: number | null
          settings: Json | null
          share_code: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["survey_status_enum"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          anonymous?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          max_responses?: number | null
          response_count?: number | null
          settings?: Json | null
          share_code?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["survey_status_enum"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          anonymous?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          max_responses?: number | null
          response_count?: number | null
          settings?: Json | null
          share_code?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["survey_status_enum"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          id: string
          min_components: number | null
          min_pages: number | null
          name: string
          stack: string[] | null
          status: Database["public"]["Enums"]["template_status_enum"] | null
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_components?: number | null
          min_pages?: number | null
          name: string
          stack?: string[] | null
          status?: Database["public"]["Enums"]["template_status_enum"] | null
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_components?: number | null
          min_pages?: number | null
          name?: string
          stack?: string[] | null
          status?: Database["public"]["Enums"]["template_status_enum"] | null
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ts_activity_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      ts_approval_log: {
        Row: {
          action: Database["public"]["Enums"]["approval_action_enum"]
          actor_id: string
          comment: string | null
          created_at: string | null
          id: string
          week_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["approval_action_enum"]
          actor_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          week_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["approval_action_enum"]
          actor_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ts_approval_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_approval_log_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "ts_timesheet_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      ts_projects: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      ts_timesheet_entries: {
        Row: {
          category_id: string
          created_at: string | null
          day_of_week: number
          description: string | null
          hours: number
          id: string
          project_id: string
          updated_at: string | null
          week_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          day_of_week: number
          description?: string | null
          hours: number
          id?: string
          project_id: string
          updated_at?: string | null
          week_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          day_of_week?: number
          description?: string | null
          hours?: number
          id?: string
          project_id?: string
          updated_at?: string | null
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ts_timesheet_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ts_activity_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_timesheet_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ts_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_timesheet_entries_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "ts_timesheet_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      ts_timesheet_weeks: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["timesheet_status_enum"] | null
          submitted_at: string | null
          total_hours: number | null
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["timesheet_status_enum"] | null
          submitted_at?: string | null
          total_hours?: number | null
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["timesheet_status_enum"] | null
          submitted_at?: string | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "ts_timesheet_weeks_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ts_timesheet_weeks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      version_history: {
        Row: {
          action: string
          artifacts_affected: string[] | null
          author: string | null
          context: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          version: string
        }
        Insert: {
          action: string
          artifacts_affected?: string[] | null
          author?: string | null
          context?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          version: string
        }
        Update: {
          action?: string
          artifacts_affected?: string[] | null
          author?: string | null
          context?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          version?: string
        }
        Relationships: []
      }
      waves: {
        Row: {
          agents: string[] | null
          artifacts_count: number | null
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          id: string
          run_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["wave_status_enum"] | null
          wave_number: number
        }
        Insert: {
          agents?: string[] | null
          artifacts_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          run_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["wave_status_enum"] | null
          wave_number: number
        }
        Update: {
          agents?: string[] | null
          artifacts_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          run_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["wave_status_enum"] | null
          wave_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "waves_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "factory_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          events: string[] | null
          id: string
          last_triggered_at: string | null
          secret: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          last_triggered_at?: string | null
          secret?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          last_triggered_at?: string | null
          secret?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_question_stats: { Args: { p_question_id: string }; Returns: Json }
    }
    Enums: {
      agent_status_enum:
        | "active"
        | "idle"
        | "running"
        | "error"
        | "disabled"
        | "maintenance"
      alert_severity_enum: "critical" | "high" | "medium" | "low" | "info"
      alert_status_enum: "open" | "acknowledged" | "resolved" | "suppressed"
      approval_action_enum: "submitted" | "approved" | "rejected"
      audit_action_enum:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "export"
        | "import"
        | "execute"
        | "approve"
        | "reject"
      contract_status_enum: "active" | "expired" | "renewed" | "cancelled"
      kr_metric_type_enum: "percentage" | "number" | "currency" | "boolean"
      lesson_status_enum: "draft" | "review" | "approved" | "archived"
      metric_category_enum: "cmi" | "dora" | "space" | "custom"
      okr_status_enum: "on_track" | "at_risk" | "behind" | "completed"
      question_type_enum:
        | "text"
        | "multiple_choice"
        | "single_choice"
        | "likert"
        | "nps"
        | "yes_no"
        | "rating"
      response_status_enum: "in_progress" | "completed" | "abandoned"
      run_status_enum:
        | "pending"
        | "running"
        | "success"
        | "failed"
        | "cancelled"
        | "timeout"
      survey_status_enum: "draft" | "active" | "paused" | "closed" | "archived"
      template_status_enum: "draft" | "active" | "deprecated" | "archived"
      timesheet_status_enum: "draft" | "submitted" | "approved" | "rejected"
      user_role_enum:
        | "owner"
        | "admin"
        | "member"
        | "viewer"
        | "guest"
        | "employee"
        | "manager"
      wave_status_enum:
        | "pending"
        | "active"
        | "completed"
        | "failed"
        | "skipped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_status_enum: [
        "active",
        "idle",
        "running",
        "error",
        "disabled",
        "maintenance",
      ],
      alert_severity_enum: ["critical", "high", "medium", "low", "info"],
      alert_status_enum: ["open", "acknowledged", "resolved", "suppressed"],
      approval_action_enum: ["submitted", "approved", "rejected"],
      audit_action_enum: [
        "create",
        "read",
        "update",
        "delete",
        "login",
        "logout",
        "export",
        "import",
        "execute",
        "approve",
        "reject",
      ],
      contract_status_enum: ["active", "expired", "renewed", "cancelled"],
      kr_metric_type_enum: ["percentage", "number", "currency", "boolean"],
      lesson_status_enum: ["draft", "review", "approved", "archived"],
      metric_category_enum: ["cmi", "dora", "space", "custom"],
      okr_status_enum: ["on_track", "at_risk", "behind", "completed"],
      question_type_enum: [
        "text",
        "multiple_choice",
        "single_choice",
        "likert",
        "nps",
        "yes_no",
        "rating",
      ],
      response_status_enum: ["in_progress", "completed", "abandoned"],
      run_status_enum: [
        "pending",
        "running",
        "success",
        "failed",
        "cancelled",
        "timeout",
      ],
      survey_status_enum: ["draft", "active", "paused", "closed", "archived"],
      template_status_enum: ["draft", "active", "deprecated", "archived"],
      timesheet_status_enum: ["draft", "submitted", "approved", "rejected"],
      user_role_enum: [
        "owner",
        "admin",
        "member",
        "viewer",
        "guest",
        "employee",
        "manager",
      ],
      wave_status_enum: ["pending", "active", "completed", "failed", "skipped"],
    },
  },
} as const
