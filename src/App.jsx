import { useEffect, useRef, useState } from 'react'

const AvatarEditor = () => {
  const [image, setImage] = useState(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })

  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = event => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        setScale(1)
        setRotation(0)
        setPosition({ x: 0, y: 0 })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleNewImage = () => {
    fileInputRef.current.click()
  }

  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.drawImage(
      image,
      position.x - image.width / 2,
      position.y - image.height / 2
    )

    ctx.restore()

    ctx.beginPath()
    ctx.arc(centerX, centerY, 150, 0, Math.PI * 2)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [image, scale, rotation, position])

  const handleMouseDown = e => {
    if (!image) return
    setIsDragging(true)
    setStartDragPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = e => {
    if (!isDragging || !image) return
    setPosition({
      x: e.clientX - startDragPos.x,
      y: e.clientY - startDragPos.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = () => {
    if (!canvasRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 300

    canvas.width = size
    canvas.height = size

    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    const sourceCanvas = canvasRef.current
    ctx.drawImage(
      sourceCanvas,
      sourceCanvas.width / 2 - 150,
      sourceCanvas.height / 2 - 150,
      300,
      300,
      0,
      0,
      size,
      size
    )

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = 'avatar.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='container'>
      <div className='editor-container'>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleImageChange}
          accept='image/*'
          style={{ display: 'none' }}
        />

        {!image ? (
          <div
            className='upload-area'
            onClick={() => fileInputRef.current.click()}
          >
            <div className='upload-icon'>+</div>
            <p>Нажмите или перетащите изображение</p>
          </div>
        ) : (
          <div className='editor-wrapper'>
            <div
              className='canvas-container'
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              />
            </div>

            <div className='controls'>
              <div className='control-group'>
                <label>Масштаб: {Math.round(scale * 100)}%</label>
                <input
                  type='range'
                  min='0.1'
                  max='3'
                  step='0.01'
                  value={scale}
                  onChange={e => setScale(parseFloat(e.target.value))}
                />
              </div>

              <div className='control-group'>
                <label>Поворот: {rotation}°</label>
                <input
                  type='range'
                  min='0'
                  max='360'
                  value={rotation}
                  onChange={e => setRotation(parseInt(e.target.value))}
                />
              </div>

              <div className='buttons-group'>
                <button
                  onClick={handleNewImage}
                  className='change-image-button'
                >
                  Выбрать другое
                </button>
                <button onClick={handleDownload} className='download-button'>
                  Скачать аватар
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvatarEditor
