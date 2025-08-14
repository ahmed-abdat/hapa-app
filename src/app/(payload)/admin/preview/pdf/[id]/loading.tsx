'use client'

export default function LoadingPage() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading PDF preview...</p>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .loading-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
          }
          
          .loading-spinner {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 1rem;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007acc;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
          }
        `
      }} />
    </div>
  )
}