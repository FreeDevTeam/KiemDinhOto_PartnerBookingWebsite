import './index.scss'
export default function BaseButton({ disabled, onClick, children }) {
  return (
    <button className="BaseButton" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
