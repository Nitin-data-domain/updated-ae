import { useState, useEffect } from 'react'
import { HiDownload } from 'react-icons/hi'
import { getBrochures, downloadBrochure } from '../api'

export default function BrochureButton({ page, programId, className = '' }) {
  const [brochure, setBrochure] = useState(null)

  useEffect(() => {
    const fetchBrochure = async () => {
      try {
        const params = {}
        if (page) params.linkedPage = page
        if (programId) params.linkedProgram = programId
        const res = await getBrochures(params)
        if (res.data.data.length > 0) {
          setBrochure(res.data.data[0])
        }
      } catch (err) {
        // Brochure not available
      }
    }
    fetchBrochure()
  }, [page, programId])

  // Don't render the button if no brochure exists for this page/program
  if (!brochure) return null

  const handleDownload = () => {
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
