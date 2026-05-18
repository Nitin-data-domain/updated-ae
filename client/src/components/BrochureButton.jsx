import { useState, useEffect } from 'react'
import { HiDownload } from 'react-icons/hi'
import { getBrochures, downloadBrochure } from '../api'

export default function BrochureButton({ page, programId, className = '' }) {
  const [brochure, setBrochure] = useState(null)

  useEffect(() => {
    const fetchBrochure = async () => {
      try {
        // 1st: try to find a brochure linked to this specific program
        if (programId) {
          const res = await getBrochures({ linkedProgram: programId })
          if (res.data.data.length > 0) {
            setBrochure(res.data.data[0])
            return
          }
        }
        // 2nd: fall back to a page-level brochure (e.g. "programs", "home")
        if (page) {
          const res = await getBrochures({ linkedPage: page })
          if (res.data.data.length > 0) {
            setBrochure(res.data.data[0])
          }
        }
      } catch (err) {
        // Brochure not available — button stays hidden
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
