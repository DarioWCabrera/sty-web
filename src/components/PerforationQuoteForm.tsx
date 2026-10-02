interface PerforationQuoteFormProps {
  depth: string;
  setDepth: (value: string) => void;

  diameter: string;
  setDiameter: (value: string) => void;

  usage: string;
  setUsage: (value: string) => void;
}

function PerforationQuoteForm({
  depth,
  setDepth,
  diameter,
  setDiameter,
  usage,
  setUsage,
}: PerforationQuoteFormProps) {
  return (
    <>
      <div className="quote-field">
        <label>
          Profundidad estimada de la perforación
        </label>

        <div className="quote-meter-input">
          <input
            type="number"
            min="1"
            step="1"
            value={depth}
            onChange={(e) =>
              setDepth(e.target.value)
            }
            placeholder="Ej: 30"
          />

          <span>metros</span>
        </div>
      </div>

      <div className="quote-field">
        <label>
          Diámetro de perforación
        </label>

        <select
          value={diameter}
          onChange={(e) =>
            setDiameter(e.target.value)
          }
        >
          <option value="4">
            4 pulgadas
          </option>

          <option value="5">
            5 pulgadas
          </option>

          <option value="6">
            6 pulgadas
          </option>

          <option value="8">
            8 pulgadas
          </option>

          <option value="otro">
            A definir por STY
          </option>
        </select>
      </div>

      <div className="quote-field">
        <label>
          Destino de la perforación
        </label>

        <select
          value={usage}
          onChange={(e) =>
            setUsage(e.target.value)
          }
        >
          <option>
            Abastecimiento de vivienda
          </option>

          <option>
            Bebederos / hacienda
          </option>

          <option>
            Riego
          </option>

          <option>
            Uso industrial
          </option>

          <option>
            Otro
          </option>
        </select>
      </div>
    </>
  );
}

export default PerforationQuoteForm;