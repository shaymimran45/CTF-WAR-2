import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://vfhilobaycsxwbjojgjc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaGlsb2JheWNzeHdiam9qZ2pjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUzMTAwOCwiZXhwIjoyMDc5MTA3MDA4fQ.cjZaPWBs_t_ScE-A9p_Ew0YOSA29GLvgiMK6JcDJBvc'

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      acc[camelKey] = toCamelCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toSnakeCase)
  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      acc[snakeKey] = toSnakeCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// Prisma-like adapter for Supabase
class SupabaseAdapter {
  private supabase: SupabaseClient

  constructor(client: SupabaseClient) {
    this.supabase = client
  }

  user = {
    findUnique: async ({ where }: any) => {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .match(toSnakeCase(where))
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    findFirst: async ({ where }: any) => {
      const conditions = where.OR || [where]
      let query = this.supabase.from('users').select('*')

      if (where.OR) {
        const orConditions = where.OR.map((condition: any) => {
          const [[key, value]] = Object.entries(condition)
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
          return `${snakeKey}.eq.${value}`
        }).join(',')
        query = query.or(orConditions)
      } else {
        query = query.match(toSnakeCase(where))
      }

      const { data, error } = await query.limit(1).single()
      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    findMany: async ({ where, select }: any = {}) => {
      let query = this.supabase.from('users').select('*')
      if (where) query = query.match(toSnakeCase(where))

      const { data, error } = await query
      if (error) throw error
      return data ? data.map(toCamelCase) : []
    },

    create: async ({ data, select }: any) => {
      const snakeData = toSnakeCase(data)
      const { data: result, error } = await this.supabase
        .from('users')
        .insert(snakeData)
        .select()
        .single()

      if (error) throw error

      const camelResult = toCamelCase(result)
      if (select) {
        return Object.keys(select).reduce((acc, key) => {
          if (select[key]) acc[key] = camelResult[key]
          return acc
        }, {} as any)
      }
      return camelResult
    },

    update: async ({ where, data }: any) => {
      const { data: result, error } = await this.supabase
        .from('users')
        .update(toSnakeCase(data))
        .match(toSnakeCase(where))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    count: async ({ where }: any = {}) => {
      const { count, error } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .match(toSnakeCase(where || {}))

      if (error) throw error
      return count || 0
    }
  }

  challenge = {
    findMany: async ({ where, include, orderBy }: any = {}) => {
      const applySelect = (record: Record<string, any>, select: Record<string, any> | undefined) => {
        if (!select) return record
        const picked: Record<string, any> = {}
        for (const [key, value] of Object.entries(select)) {
          if (value && record[key] !== undefined) {
            picked[key] = record[key]
          }
        }
        return picked
      }

      let query = this.supabase.from('challenges').select('*')

      if (where) query = query.match(toSnakeCase(where))
      if (orderBy) {
        if (Array.isArray(orderBy)) {
          orderBy.forEach((order: any) => {
            const [[key, dir]] = Object.entries(order)
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
            query = query.order(snakeKey, { ascending: dir === 'asc' })
          })
        }
      }

      const { data, error } = await query
      if (error) throw error

      const challenges = data ? data.map(toCamelCase) : []

      if (include?.files) {
        for (const challenge of challenges) {
          const { data: files } = await this.supabase
            .from('challenge_files')
            .select('*')
            .eq('challenge_id', challenge.id)

          const formatted = files ? files.map(toCamelCase) : []
          challenge.files = include.files.select
            ? formatted.map(file => applySelect(file, include.files.select))
            : formatted
        }
      }

      if (include?.hints) {
        for (const challenge of challenges) {
          const { data: hints } = await this.supabase
            .from('hints')
            .select('*')
            .eq('challenge_id', challenge.id)

          const formatted = hints ? hints.map(toCamelCase) : []
          challenge.hints = include.hints.select
            ? formatted.map(hint => applySelect(hint, include.hints.select))
            : formatted
        }
      }

      if (include?._count?.select?.solves) {
        for (const challenge of challenges) {
          const { count } = await this.supabase
            .from('solves')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)
          challenge._count = { solves: count || 0 }
        }
      }

      return challenges
    },

    findFirst: async ({ where, include }: any) => {
      let query = this.supabase.from('challenges').select('*')
      if (where) query = query.match(toSnakeCase(where))

      const { data, error } = await query.limit(1).single()
      if (error && error.code !== 'PGRST116') throw error

      if (!data) return null
      const challenge = toCamelCase(data)

      if (include) {
        if (include.files) {
          const { data: files } = await this.supabase
            .from('challenge_files')
            .select('*')
            .eq('challenge_id', challenge.id)
          challenge.files = files ? files.map(toCamelCase) : []
        }
        if (include.hints) {
          const { data: hints } = await this.supabase
            .from('hints')
            .select('*')
            .eq('challenge_id', challenge.id)
          challenge.hints = hints ? hints.map(toCamelCase) : []
        }
        if (include._count?.select?.solves) {
          const { count } = await this.supabase
            .from('solves')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id)
          challenge._count = { solves: count || 0 }
        }
      }

      return challenge
    },

    findUnique: async ({ where, include }: any) => {
      return this.challenge.findFirst({ where, include })
    },

    create: async ({ data }: any) => {
      const { data: result, error } = await this.supabase
        .from('challenges')
        .insert(toSnakeCase(data))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    update: async ({ where, data }: any) => {
      const { data: result, error } = await this.supabase
        .from('challenges')
        .update(toSnakeCase(data))
        .match(toSnakeCase(where))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    updateMany: async ({ where, data }: any) => {
      const { data: result, error } = await this.supabase
        .from('challenges')
        .update(toSnakeCase(data))
        .match(toSnakeCase(where))
        .select()

      if (error) throw error
      return { count: result?.length || 0 }
    },

    delete: async ({ where }: any) => {
      const { error } = await this.supabase
        .from('challenges')
        .delete()
        .match(toSnakeCase(where))

      if (error) throw error
      return {}
    },

    deleteMany: async ({ where }: any = {}) => {
      let query = this.supabase.from('challenges').delete()
      if (where && Object.keys(where).length > 0) {
        query = query.match(toSnakeCase(where))
      }

      const { data, error } = await query.select()
      if (error) throw error
      return { count: data?.length || 0 }
    },

    count: async ({ where }: any = {}) => {
      const { count, error } = await this.supabase
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .match(toSnakeCase(where))

      if (error) throw error
      return count || 0
    },

    groupBy: async ({ by, where, _count }: any) => {
      let query = this.supabase.from('challenges').select('*')
      if (where) query = query.match(toSnakeCase(where))

      const { data, error } = await query
      if (error) throw error

      const grouped = (data || []).reduce((acc: any, row: any) => {
        const key = by.map((field: string) => {
          const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
          return row[snakeField]
        }).join('|')

        if (!acc[key]) {
          acc[key] = {
            ...by.reduce((obj: any, field: string) => {
              const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
              obj[field] = row[snakeField]
              return obj
            }, {}),
            _count: { id: 0 }
          }
        }
        acc[key]._count.id++
        return acc
      }, {})

      return Object.values(grouped)
    }
  }

  solve = {
    findMany: async ({ where, select, orderBy, take }: any = {}) => {
      let query = this.supabase.from('solves').select('*')
      if (where) query = query.match(toSnakeCase(where))
      if (orderBy) {
        const [[key, dir]] = Object.entries(orderBy)
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        query = query.order(snakeKey, { ascending: dir === 'asc' })
      }
      if (take) query = query.limit(take)

      const { data, error } = await query
      if (error) throw error

      const solves = data ? data.map(toCamelCase) : []

      if (select) {
        for (const solve of solves) {
          if (select.user) {
            const { data: user } = await this.supabase
              .from('users')
              .select('*')
              .eq('id', solve.userId)
              .single()
            solve.user = user ? toCamelCase(user) : null
          }
          if (select.challenge) {
            const { data: challenge } = await this.supabase
              .from('challenges')
              .select('*')
              .eq('id', solve.challengeId)
              .single()
            solve.challenge = challenge ? toCamelCase(challenge) : null
          }
        }

        return solves.map(solve => {
          const filtered: any = {}
          Object.keys(select).forEach(key => {
            if (select[key]) filtered[key] = solve[key]
          })
          return filtered
        })
      }

      return solves
    },

    findFirst: async ({ where }: any) => {
      const { data, error } = await this.supabase
        .from('solves')
        .select('*')
        .match(toSnakeCase(where))
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    create: async ({ data }: any) => {
      const { data: result, error } = await this.supabase
        .from('solves')
        .insert(toSnakeCase(data))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    count: async ({ where }: any = {}) => {
      const { count, error } = await this.supabase
        .from('solves')
        .select('*', { count: 'exact', head: true })
        .match(toSnakeCase(where || {}))

      if (error) throw error
      return count || 0
    }
  }

  submission = {
    create: async ({ data }: any) => {
      const { data: result, error } = await this.supabase
        .from('submissions')
        .insert(toSnakeCase(data))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    count: async ({ where }: any = {}) => {
      const { count, error } = await this.supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .match(toSnakeCase(where))

      if (error) throw error
      return count || 0
    }
  }

  team = {
    findMany: async ({ select }: any = {}) => {
      let query = this.supabase.from('teams').select('*')

      const { data, error } = await query
      if (error) throw error

      const teams = data ? data.map(toCamelCase) : []

      if (select) {
        for (const team of teams) {
          if (select._count?.select?.solves) {
            const { count } = await this.supabase
              .from('solves')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id)
            team._count = { solves: count || 0 }
          }
          if (select.solves) {
            const { data: solves } = await this.supabase
              .from('solves')
              .select('*')
              .eq('team_id', team.id)
              .order('solved_at', { ascending: false })
            team.solves = solves ? solves.map(toCamelCase) : []
          }
        }
      }

      return teams
    },

    findUnique: async ({ where, select }: any) => {
      const { data, error } = await this.supabase
        .from('teams')
        .select('*')
        .match(toSnakeCase(where))
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (!data) return null

      const team = toCamelCase(data)

      if (select?.memberships) {
        const { data: memberships } = await this.supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)

        team.memberships = []
        for (const membership of memberships || []) {
          const { data: user } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', membership.user_id)
            .single()

          team.memberships.push({
            joinedAt: membership.joined_at,
            user: user ? { id: user.id, username: user.username } : null
          })
        }
      }

      return team
    },

    create: async ({ data }: any) => {
      const { data: result, error } = await this.supabase
        .from('teams')
        .insert(toSnakeCase(data))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    update: async ({ where, data }: any) => {
      const { data: result, error } = await this.supabase
        .from('teams')
        .update(toSnakeCase(data))
        .match(toSnakeCase(where))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    delete: async ({ where }: any) => {
      const { error } = await this.supabase
        .from('teams')
        .delete()
        .match(toSnakeCase(where))

      if (error) throw error
      return {}
    }
  }

  teamMember = {
    count: async ({ where }: any) => {
      const { count, error } = await this.supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .match(toSnakeCase(where))

      if (error) throw error
      return count || 0
    },

    findMany: async ({ where }: any) => {
      const { data, error } = await this.supabase
        .from('team_members')
        .select('*')
        .match(toSnakeCase(where))

      if (error) throw error
      return data ? data.map(toCamelCase) : []
    },

    findUnique: async ({ where }: any) => {
      const snakeWhere = toSnakeCase(where.teamId_userId || where)
      const { data, error } = await this.supabase
        .from('team_members')
        .select('*')
        .match(snakeWhere)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    create: async ({ data }: any) => {
      const { data: result, error } = await this.supabase
        .from('team_members')
        .insert(toSnakeCase(data))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    upsert: async ({ where, update, create }: any) => {
      const snakeWhere = toSnakeCase(where.teamId_userId || where)
      const { data: existing } = await this.supabase
        .from('team_members')
        .select('*')
        .match(snakeWhere)
        .single()

      if (existing) {
        const { data: result, error } = await this.supabase
          .from('team_members')
          .update(toSnakeCase(update))
          .match(snakeWhere)
          .select()
          .single()

        if (error) throw error
        return toCamelCase(result)
      } else {
        const { data: result, error } = await this.supabase
          .from('team_members')
          .insert(toSnakeCase(create))
          .select()
          .single()

        if (error) throw error
        return toCamelCase(result)
      }
    },

    delete: async ({ where }: any) => {
      const snakeWhere = toSnakeCase(where.teamId_userId || where)
      const { error } = await this.supabase
        .from('team_members')
        .delete()
        .match(snakeWhere)

      if (error) throw error
      return {}
    }
  }

  competition = {
    findFirst: async ({ orderBy }: any = {}) => {
      let query = this.supabase.from('competitions').select('*')
      if (orderBy) {
        const [[key, dir]] = Object.entries(orderBy)
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        query = query.order(snakeKey, { ascending: dir === 'asc' })
      }

      const { data, error } = await query.limit(1).single()
      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    findUnique: async ({ where }: any) => {
      const { data, error } = await this.supabase
        .from('competitions')
        .select('*')
        .match(toSnakeCase(where))
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    create: async ({ data }: any) => {
      const { data: result, error } = await this.supabase
        .from('competitions')
        .insert(toSnakeCase(data))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    }
  }

  challengeFile = {
    findUnique: async ({ where }: any) => {
      const { data, error } = await this.supabase
        .from('challenge_files')
        .select('*')
        .match(toSnakeCase(where))
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    createMany: async ({ data }: any) => {
      const { error } = await this.supabase
        .from('challenge_files')
        .insert(data.map(toSnakeCase))

      if (error) throw error
      return { count: data.length }
    },

    delete: async ({ where }: any) => {
      const { error } = await this.supabase
        .from('challenge_files')
        .delete()
        .match(toSnakeCase(where))

      if (error) throw error
      return {}
    }
  }

  hint = {
    create: async ({ data }: any) => {
      const { data: result, error } = await this.supabase
        .from('hints')
        .insert(toSnakeCase(data))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    findUnique: async ({ where }: any) => {
      const { data, error } = await this.supabase
        .from('hints')
        .select('*')
        .match(toSnakeCase(where))
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data ? toCamelCase(data) : null
    },

    update: async ({ where, data }: any) => {
      const { data: result, error } = await this.supabase
        .from('hints')
        .update(toSnakeCase(data))
        .match(toSnakeCase(where))
        .select()
        .single()

      if (error) throw error
      return toCamelCase(result)
    },

    delete: async ({ where }: any) => {
      const { error } = await this.supabase
        .from('hints')
        .delete()
        .match(toSnakeCase(where))

      if (error) throw error
      return {}
    }
  }

  $disconnect = async () => {
    // Supabase doesn't need explicit disconnection
    return Promise.resolve()
  }
}

const prisma = new SupabaseAdapter(supabase)

export default prisma