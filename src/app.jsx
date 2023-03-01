import * as React from "react";
import ReactDOM from "react-dom/client";
import CyrillicToTranslit from "cyrillic-to-translit-js";
import { useClipboard } from "use-clipboard-copy";
import "./App.css";

const ItemComponent = ({ str }) => {
  return (
    <div className="str">
      <p>{str}</p>
    </div>
  );
};

function App() {
  const folderNumRef = React.useRef();
  const productNameRef = React.useRef();
  const countPhotoRef = React.useRef();
  const [str, setStr] = React.useState("");
  const clipboard = useClipboard();

  const handleSubmit = React.useCallback((event) => {
    const cyrillicToTranslit = new CyrillicToTranslit();
    event.preventDefault();
    const folderNumValue = folderNumRef.current.value;
    const productNameValue = productNameRef.current.value;
    const countPhotoValue = countPhotoRef.current.value;

    // eslint-disable-next-line no-useless-escape
    const replaceProductName = productNameValue.replace(/[\"\.\/\(\)]/g, "");
    const translateProductName = cyrillicToTranslit
      .transform(replaceProductName, "-")
      .toLowerCase();

    window.electron.send("submit-photo", translateProductName);

    const getPath = (pathNumber, str, count) =>
      `${pathNumber}/${str}-${count}.jpg|`;

    let result = "";
    for (let i = 1; i <= countPhotoValue; i++) {
      result += getPath(folderNumValue, translateProductName, i);
    }
    setStr(result.slice(0, -1));
    productNameRef.current.value = "";
    countPhotoRef.current.value = "";
  }, []);

  const handleChooseFile = React.useCallback(() => {
    window.electron.send("choose-folder", "choose");
  }, []);

  return (
    <div className="App">
      <div className="input-container">
        <button onClick={handleChooseFile}>Choose folder</button>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-container">
          <input type="text" ref={folderNumRef} placeholder="Folder number:" />
        </div>
        <div className="input-container">
          <input type="text" ref={productNameRef} placeholder="Product Name:" />
        </div>
        <div className="input-container">
          <input
            type="text"
            ref={countPhotoRef}
            placeholder="Number of photos:"
          />
        </div>
        <button className="button" type="submit">
          Submit
        </button>
      </form>
      <button onClick={() => clipboard.copy(str)} className="button">
        Copy Text
      </button>
      <ItemComponent str={str} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
