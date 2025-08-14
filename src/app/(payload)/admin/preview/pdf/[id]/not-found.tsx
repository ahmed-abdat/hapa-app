'use client'

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>PDF Not Found</h1>
        <p>The PDF document you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
        <div className="actions">
          <button onClick={() => window.close()} className="close-btn">
            Close Window
          </button>
          <button onClick={() => window.location.href = '/admin'} className="admin-link">
            Go to Admin
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .not-found-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
          }
          
          .not-found-content {
            text-align: center;
            padding: 3rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          
          h1 {
            margin: 0 0 1rem 0;
            color: #d32f2f;
            font-size: 1.5rem;
          }
          
          p {
            margin: 0 0 2rem 0;
            color: #666;
            line-height: 1.5;
          }
          
          .actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          
          .close-btn, .admin-link {
            padding: 0.75rem 1.5rem;
            border: 1px solid #d0d0d0;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            text-decoration: none;
            color: #333;
            font-size: 0.9rem;
            transition: all 0.2s ease;
          }
          
          .close-btn:hover, .admin-link:hover {
            background: #f8f8f8;
            border-color: #999;
          }
          
          .admin-link {
            background: #007acc;
            color: white;
            border-color: #007acc;
          }
          
          .admin-link:hover {
            background: #005a9c;
            border-color: #005a9c;
          }
        `
      }} />
    </div>
  )
}