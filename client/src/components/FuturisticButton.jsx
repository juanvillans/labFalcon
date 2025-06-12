export default function FuturisticButton({ children }, props) {
  return (
    <button className="kave-btn" onClick={()=> props.onClick()}>
      <span className="kave-line"></span>
      {children}
    </button>
  );
}
