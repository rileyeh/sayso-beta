import Head from 'next/head'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useSupabase } from '@/hooks/useSupabase'

type KidProfile = {
  id: string
  name: string
  nickname: string | null
  color_tag: string | null
  avatar_url: string | null
}

type KidFormState = {
  nickname: string
  color_tag: string
  avatar_url: string | null
}

type StatusMessage = {
  type: 'success' | 'error'
  message: string
}

const COLOR_OPTIONS = [
  { value: 'pink', label: 'Pink', hex: '#F8D5D3' },
  { value: 'red', label: 'Coral', hex: '#ED6228' },
  { value: 'blue', label: 'Sky', hex: '#D3E3E6' },
  { value: 'green', label: 'Olive', hex: '#BDA632' },
  { value: 'cream', label: 'Cream', hex: '#FBE2C4' },
  { value: 'plum', label: 'Plum', hex: '#C7A2C9' },
] as const

const AVATAR_BUCKET = 'kid-avatars'

const DEFAULT_COLOR = COLOR_OPTIONS[0].value

export default function ManageKidsPage() {
  const supabase = useSupabase()

  const [kids, setKids] = useState<KidProfile[]>([])
  const [formState, setFormState] = useState<Record<string, KidFormState>>({})
  const [statuses, setStatuses] = useState<Record<string, StatusMessage | null>>({})
  const [pageError, setPageError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingKidId, setSavingKidId] = useState<string | null>(null)
  const [uploadingKidId, setUploadingKidId] = useState<string | null>(null)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const hasKids = useMemo(() => kids.length > 0, [kids])

  const syncFormState = useCallback((rows: KidProfile[]) => {
    setFormState(
      rows.reduce((acc, kid) => {
        acc[kid.id] = {
          nickname: kid.nickname ?? '',
          color_tag: kid.color_tag ?? DEFAULT_COLOR,
          avatar_url: kid.avatar_url ?? null,
        }
        return acc
      }, {} as Record<string, KidFormState>
    )
  )
  }, [])

  const fetchKids = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    setPageError(null)

    try {
      const {
        data: family,
        error: familyError,
      } = await supabase.from('families').select('id').limit(1).single()

      if (familyError) {
        if (familyError.code === 'PGRST116') {
          setKids([])
          syncFormState([])
          setPageError('We could not find your family record. Please complete onboarding.')
          return
        }
        throw familyError
      }

      const {
        data: children,
        error: childrenError,
      } = await supabase
        .from('children')
        .select('id, name, nickname, color_tag, avatar_url')
        .eq('family_id', family.id)
        .order('created_at', { ascending: true })

      if (childrenError) throw childrenError

      const rows = (children ?? []) as KidProfile[]
      setKids(rows)
      syncFormState(rows)
    } catch (err: any) {
      console.error('Failed to fetch kids', err)
      setPageError(err.message ?? 'Something went wrong while loading your kids.')
    } finally {
      setLoading(false)
    }
  }, [supabase, syncFormState])

  useEffect(() => {
    if (!supabase) return
    fetchKids()
  }, [supabase, fetchKids])

  const updateStatus = useCallback((kidId: string, status: StatusMessage | null) => {
    setStatuses((prev) => ({ ...prev, [kidId]: status }))
  }, [])

  const handleFieldChange = (kidId: string, field: keyof KidFormState, value: string | null) => {
    setFormState((prev) => ({
      ...prev,
      [kidId]: {
        ...prev[kidId],
        [field]: value,
      },
    }))
    updateStatus(kidId, null)
  }

  const handleSave = async (kidId: string) => {
    if (!supabase) return
    const form = formState[kidId]
    if (!form) return

    setSavingKidId(kidId)
    updateStatus(kidId, null)

    const payload = {
      nickname: form.nickname.trim() === '' ? null : form.nickname.trim(),
      color_tag: form.color_tag || DEFAULT_COLOR,
      avatar_url: form.avatar_url,
    }

    try {
      const { error } = await supabase.from('children').update(payload).eq('id', kidId)
      if (error) throw error

      setKids((prev) =>
        prev.map((kid) =>
          kid.id === kidId
            ? {
                ...kid,
                nickname: payload.nickname,
                color_tag: payload.color_tag,
                avatar_url: payload.avatar_url,
              }
            : kid
        )
      )

      updateStatus(kidId, {
        type: 'success',
        message: 'Profile updated',
      })
    } catch (err: any) {
      console.error('Failed to update kid', err)
      updateStatus(kidId, {
        type: 'error',
        message: err.message ?? 'Unable to save changes',
      })
    } finally {
      setSavingKidId(null)
    }
  }

  const handleAvatarUpload = async (kidId: string, file: File | null) => {
    if (!supabase || !file) return

    setUploadingKidId(kidId)
    updateStatus(kidId, null)

    try {
      const ext = file.name.split('.').pop() || 'png'
      const sanitizedBase = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .toLowerCase() || 'avatar'
      const fileName = `${sanitizedBase}-${Date.now()}.${ext}`
      const filePath = `${kidId}/${fileName}`

      const { error: uploadError } = await supabase
        .storage
        .from(AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)

      if (!publicUrl) throw new Error('Could not get avatar URL')

      const { error } = await supabase
        .from('children')
        .update({ avatar_url: publicUrl })
        .eq('id', kidId)

      if (error) throw error

      setFormState((prev) => ({
        ...prev,
        [kidId]: {
          ...prev[kidId],
          avatar_url: publicUrl,
        },
      }))

      setKids((prev) =>
        prev.map((kid) =>
          kid.id === kidId
            ? {
                ...kid,
                avatar_url: publicUrl,
              }
            : kid
        )
      )

      updateStatus(kidId, {
        type: 'success',
        message: 'Profile picture updated',
      })
    } catch (err: any) {
      console.error('Failed to upload avatar', err)
      updateStatus(kidId, {
        type: 'error',
        message: err.message ?? 'Unable to upload picture',
      })
    } finally {
      setUploadingKidId(null)
      const input = fileInputRefs.current[kidId]
      if (input) {
        input.value = ''
      }
    }
  }

  return (
    <>
      <Head>
        <title>Manage Kids • SaySo</title>
      </Head>
      <main className='min-h-screen bg-sayso-cream/40 py-10 px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl space-y-8'>
          <header className='space-y-2'>
            <h1 className='text-3xl font-playfair text-sayso-brown'>Manage kids</h1>
            <p className='text-sayso-brown/80'>Update profile pictures, nicknames, and color tags for each child.</p>
          </header>

            {loading ? (
              <div className='rounded-2xl border border-sayso-brown/10 bg-white p-8 text-center text-sayso-brown/70 shadow-sm'>
                Loading your kids…
              </div>
            ) : pageError ? (
              <div className='rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm'>
                {pageError}
              </div>
            ) : !hasKids ? (
              <div className='rounded-2xl border border-sayso-brown/10 bg-white p-8 text-center text-sayso-brown/70 shadow-sm'>
                No kids on file yet. Add your first child during onboarding or contact support for help.
              </div>
            ) : (
              <div className='space-y-6'>
                {kids.map((kid) => {
                  const form = formState[kid.id]
                  const status = statuses[kid.id]

                  return (
                    <section
                      key={kid.id}
                      className='rounded-2xl border border-sayso-brown/10 bg-white/90 p-6 shadow-sm backdrop-blur'
                    >
                      <div className='flex flex-col gap-6 sm:flex-row sm:items-start'>
                      <div className='flex flex-col items-center gap-3 sm:w-48'>
                        {form?.avatar_url ? (
                          <img
                            src={form.avatar_url}
                            alt={`${kid.name} avatar`}
                            className='h-32 w-32 rounded-full object-cover shadow-sm'
                          />
                        ) : (
                          <div
                            className='flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-sayso-brown/30 bg-sayso-cream text-4xl font-playfair text-sayso-brown/60 shadow-inner'
                          >
                            {kid.name?.slice(0, 1)?.toUpperCase() ?? '?'}
                          </div>
                        )}

                        <input
                          ref={(el) => {
                            fileInputRefs.current[kid.id] = el
                          }}
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={(event) =>
                            handleAvatarUpload(kid.id, event.target.files?.[0] ?? null)
                          }
                        />

                        <button
                          type='button'
                          onClick={() => fileInputRefs.current[kid.id]?.click()}
                          className='rounded-full border border-sayso-brown/30 px-4 py-2 text-sm font-medium text-sayso-brown transition hover:border-sayso-red/50 hover:text-sayso-red'
                          disabled={uploadingKidId === kid.id}
                        >
                          {uploadingKidId === kid.id ? 'Uploading…' : 'Change photo'}
                        </button>
                      </div>

                      <div className='flex-1 space-y-5'>
                        <div>
                          <p className='text-xs uppercase tracking-wide text-sayso-brown/50'>Full name</p>
                          <p className='text-lg font-medium text-sayso-brown'>{kid.name}</p>
                        </div>

                        <label className='block space-y-2'>
                          <span className='text-sm font-medium text-sayso-brown'>Nickname</span>
                          <input
                            value={form?.nickname ?? ''}
                            onChange={(event) =>
                              handleFieldChange(kid.id, 'nickname', event.target.value)
                            }
                            placeholder='Add a nickname'
                            className='w-full rounded-xl border border-sayso-brown/20 bg-white px-4 py-2 text-sayso-brown shadow-sm focus:border-sayso-red/60 focus:outline-none focus:ring-2 focus:ring-sayso-red/20'
                          />
                          <span className='text-xs text-sayso-brown/60'>Optional. Used on cards and reminders.</span>
                        </label>

                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-sayso-brown'>Color tag</p>
                          <div className='flex flex-wrap gap-3'>
                            {COLOR_OPTIONS.map((option) => {
                              const isActive = option.value === form?.color_tag
                              return (
                                <button
                                  key={option.value}
                                  type='button'
                                  onClick={() => handleFieldChange(kid.id, 'color_tag', option.value)}
                                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    isActive
                                      ? 'border-sayso-red ring-2 ring-sayso-red/30'
                                      : 'border-transparent hover:border-sayso-brown/40'
                                  }`}
                                  style={{ backgroundColor: option.hex }}
                                  aria-label={`Set color ${option.label}`}
                                >
                                  {isActive ? (
                                    <span className='text-sm font-semibold text-sayso-brown'>✓</span>
                                  ) : null}
                                </button>
                              )
                            })}
                          </div>
                          <span className='text-xs text-sayso-brown/60'>We use the color tag across the app to help kids spot their space.</span>
                        </div>

                        <div className='flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between'>
                          <button
                            type='button'
                            onClick={() => handleSave(kid.id)}
                            disabled={savingKidId === kid.id}
                            className='inline-flex items-center justify-center rounded-full bg-sayso-red px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sayso-red/90 disabled:cursor-not-allowed disabled:opacity-70'
                          >
                            {savingKidId === kid.id ? 'Saving…' : 'Save changes'}
                          </button>

                          <div className='text-sm'>
                            <span
                              className={
                                status?.type === 'success'
                                  ? 'text-green-700'
                                  : status?.type === 'error'
                                  ? 'text-red-600'
                                  : 'text-sayso-brown/60'
                              }
                            >
                              {status?.message ?? 'Tip: Hit save after updating nickname or color.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
