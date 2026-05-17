import { useState, useEffect } from 'react'
import { HiDownload } from 'react-icons/hi'
import { getBrochures, downloadBrochure } from '../api'

export default function BrochureButton({ page, programId, className = '' }) {
  const [brochure, setBrochure] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrochure = async () => {
      try {
        const params = {}
        if (page) params.linkedPage = page
        if (programId) params.linkedProgram = programId
        const res = await getBrochures(params)
        if (res.data.data && res.data.data.length > 0) {
          setBrochure(res.data.data[0])
        }
      } catch (err) {
        // Brochure not available — button won't show
      } finally {
        setLoading(false)
      }
    }
    fetchBrochure()
  }, [page, programId])

  // Don't render anything while loading or if no brochure exists
  if (loading || !brochure) return null

  const handleDownload = () => {
    // Use the backend download route which streams with correct headers
    window.open(downloadBrochure(brochure._id), '_blank')
  }

  return (
    <button
      className={`btn btn-download ${className}`}
      onClick={handleDownload}
      id={`download-brochure-${page || 'program'}`}
    >
      <HiDownload size={18} />
      Download Brochure
    </button>
  )
}
