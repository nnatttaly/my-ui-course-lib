import "./App.css";
import { useRef } from "react";
import { Button, SIZES, VARIANTS } from "./components/Button";

function App() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <>
      <div className="polymorphic-demo">
        <Button ref={buttonRef} onClick={() => linkRef.current?.focus()}>
          as="button"
        </Button>
        <Button as="a" href="#" ref={linkRef}>
          as="a"
        </Button>
        <Button as="a" href="#" disabled>
          as="a" disabled
        </Button>
      </div>
      <table className="button-states">
        <thead>
          <tr>
            <th>variant</th>
            <th>size</th>
            <th>default</th>
            <th>:hover</th>
            <th>:active</th>
            <th>disabled</th>
          </tr>
        </thead>
        <tbody>
          {VARIANTS.map((variant) =>
            SIZES.map((size) => (
              <tr key={`${variant}-${size}`}>
                <td>{variant}</td>
                <td>{size}</td>
                <td>
                  <Button variant={variant} size={size}>
                    Кнопка
                  </Button>
                </td>
                <td>
                  <Button variant={variant} size={size} data-state="hover">
                    Кнопка
                  </Button>
                </td>
                <td>
                  <Button variant={variant} size={size} data-state="active">
                    Кнопка
                  </Button>
                </td>
                <td>
                  <Button variant={variant} size={size} disabled >
                    Кнопка
                  </Button>
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </>
  );
}

export default App;
