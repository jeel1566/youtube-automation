import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Plus, Trash2, RefreshCw, Youtube } from 'lucide-react'

interface VideoItem {
  id: string
  youtube_url: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  custom_description: string
  created_at: string
  error_message: string | null
}

function App() {
  const [urls, setUrls] = useState('')
  const [description, setDescription] = useState('')
  const [queue, setQueue] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    setRefreshing(true)
    const { data, error } = await supabase
      .from('video_queue')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching queue:', error)
    else setQueue(data || [])
    setRefreshing(false)
  }

  const handleAddToQueue = async () => {
    if (!urls.trim()) return
    setLoading(true)

    const urlList = urls.split('\n').filter(u => u.trim().length > 0)

    const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/|)([\w-]{11})(.*)?$/;

    const invalidUrls = urlList.filter(url => !youtubeUrlRegex.test(url.trim()));

    if (invalidUrls.length > 0) {
      alert('The following URLs are not valid YouTube links:\n' + invalidUrls.join('\n'));
      setLoading(false);
      return;
    }

    const inserts = urlList.map(url => ({
      youtube_url: url.trim(),
      custom_description: description,
      status: 'pending'
    }))

    const { error } = await supabase
      .from('video_queue')
      .insert(inserts)

    if (error) {
      alert('Error adding to queue: ' + error.message)
    } else {
      setUrls('')
      setDescription('')
      fetchQueue()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('video_queue')
      .delete()
      .eq('id', id)

    if (error) alert('Error deleting: ' + error.message)
    else fetchQueue()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Youtube className="text-red-500" />
            Automation Hub
          </h1>
          <button
            onClick={fetchQueue}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <RefreshCw className={`w - 5 h - 5 ${refreshing ? 'animate-spin' : ''} `} />
          </button>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Input Section */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Videos
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">YouTube URLs (one per line)</label>
                <textarea
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Custom Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Check out this video..."
                />
              </div>

              <button
                onClick={handleAddToQueue}
                disabled={loading || !urls.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Adding...' : 'Add to Queue'}
              </button>
            </div>
          </div>

          {/* Queue Section */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Queue ({queue.length})</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {queue.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Queue is empty</p>
              ) : (
                queue.map((item) => (
                  <div key={item.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex items-start justify-between group">
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate text-blue-400">
                        {item.youtube_url}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Status: <span className={`
                          ${item.status === 'done' ? 'text-green-500' : ''}
                          ${item.status === 'processing' ? 'text-yellow-500' : ''}
                          ${item.status === 'failed' ? 'text-red-500' : ''}
                          ${item.status === 'pending' ? 'text-gray-400' : ''}
`}>{item.status.toUpperCase()}</span>
                      </p>
                      {item.status === 'failed' && item.error_message && (
                        <p className="text-xs text-red-400 mt-1">
                          Error: {item.error_message}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
