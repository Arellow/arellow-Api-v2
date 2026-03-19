import Busboy from "busboy";
import { ALLOWED_MEDIA_FIELDS, MediaField, UploadFile } from "./routes/property.validate";
export interface ParsedFormData {
  body: Record<string, any>;
  files: UploadFile[];
}

const tryParseJSON = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const setDeep = (obj: any, path: string, value: any) => {
  const keys = path
    .replace(/\]/g, "")
    .split("["); // converts a[b][c] → ['a','b','c']

  let current = obj;

  keys.forEach((key, index) => {
    const nextKey = keys[index + 1];
    const isLast = index === keys.length - 1;

    // Detect array index
    const isArrayIndex = !isNaN(Number(key));

    if (isLast) {
      if (isArrayIndex) {
        if (!Array.isArray(current)) current = [];
        current[key] = value;
      } else {
        current[key] = value;
      }
    } else {
      if (!current[key]) {
        current[key] = isNaN(Number(nextKey)) ? {} : [];
      }
      current = current[key];
    }
  });
};



export const parseFormData = (req: any): Promise<ParsedFormData> => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: 50 * 1024 * 1024 },
    });

    const body: Record<string, any> = {};
    const files: UploadFile[] = [];

    let error: string | null = null;

    busboy.on("field", (fieldname, value) => {
         if (fieldname && !ALLOWED_MEDIA_FIELDS.has(fieldname as MediaField)) {
             const parsedValue = tryParseJSON(value);
             setDeep(body, fieldname, parsedValue);
         }
    });

  
    busboy.on("file", (fieldname:any, file:any, filename:any) => {
      if (!filename) return;

      if (!ALLOWED_MEDIA_FIELDS.has(fieldname as MediaField)) {
        file.resume();
        error = `Invalid field: ${fieldname}`;
        return;
      }


      if (!filename?.mimeType.startsWith("image/") && !filename?.mimeType.startsWith("video/")) {
        file.resume();
        error = `Invalid file type: ${filename?.mimeType}`;
        return;
      }
     

      const chunks: Buffer[] = [];

      file.on("data", (chunk:any) => chunks.push(chunk));

      file.on("end", () => {
        files.push({
          buffer: Buffer.concat(chunks),

        // stream: file,
          originalname: filename,
          mimetype: filename?.mimeType,
          field: fieldname as MediaField,
        });
      });
    });

    busboy.on("finish", () => {
      if (error) return reject(new Error(error));
      resolve({ body, files });
    });

    busboy.on("error", reject);

    req.pipe(busboy);
  });
};