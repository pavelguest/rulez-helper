import * as React from "react";
import ReactDOM from "react-dom/client";
import CyrillicToTranslit from "cyrillic-to-translit-js";
import { useClipboard } from "use-clipboard-copy";

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

  const handleRemoveImages = React.useCallback(() => {
    window.electron.send("remove-files", "remove");
  }, []);

  return (
    <div className="App">
      <div className="button-container">
        <button onClick={handleChooseFile} className="button">
          Выберите папку
        </button>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            ref={folderNumRef}
            placeholder="Номер папки на сервере"
            className="input-form"
          />
        </div>
        <div className="input-container">
          <input
            type="text"
            ref={productNameRef}
            placeholder="Имя продукта"
            className="input-form"
          />
        </div>
        <div className="input-container">
          <input
            type="text"
            ref={countPhotoRef}
            placeholder="Количество изображений"
            className="input-form"
          />
        </div>
        <button className="button button-submit" type="submit">
          Конвертировать
        </button>
      </form>
      <button onClick={() => clipboard.copy(str)} className="button">
        Копировать путь
      </button>
      <button onClick={() => {}} className="button">
        Копировать изображения
      </button>
      <button onClick={handleRemoveImages} className="button">
        Удалить файлы из папки
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
