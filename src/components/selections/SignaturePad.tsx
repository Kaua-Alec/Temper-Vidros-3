import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Modal } from "./Clientes";
import { Eraser, Check } from "lucide-react";

export function SignaturePadModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (base64: string) => void;
}) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [error, setError] = useState("");

  const handleClear = () => {
    sigCanvas.current?.clear();
    setError("");
  };

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      setError("Por favor, assine antes de salvar.");
      return;
    }
    // Get trimmed base64 image (PNG with transparent background)
    const base64 = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    if (base64) {
      onSave(base64);
      onClose();
    }
  };

  return (
    <>
      {open && (
        <Modal onClose={onClose} title="Assinatura do Cliente">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Utilize o espaço abaixo para o cliente assinar o orçamento. A assinatura será incluída no PDF gerado.
            </p>
            
            <div className="border-2 border-dashed border-navy-border rounded-lg bg-white overflow-hidden relative">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  className: "w-full h-48 sm:h-64 cursor-crosshair",
                }}
                backgroundColor="rgba(255,255,255,0)"
              />
            </div>
            
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-white transition"
              >
                <Eraser className="h-4 w-4" /> Limpar
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy-deep hover:bg-gold-2 transition"
                >
                  <Check className="h-4 w-4" /> Confirmar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
