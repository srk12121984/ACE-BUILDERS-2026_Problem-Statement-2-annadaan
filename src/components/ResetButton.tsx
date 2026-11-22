type Props = {
  onReset: () => void;
};

export default function ResetButton({ onReset }: Props) {
  return (
    <button
      type="button"
      onClick={onReset}
      style={{
        background: "#2E2A26",
        color: "#F5F1EA",
        border: "none",
        padding: "8px 12px",
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      Reset demo
    </button>
  );
}
