export const convertFileToBlob = (file: File) => {
  return new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      resolve(blob);
    };

    reader.readAsArrayBuffer(file);
  });
};