export type MediaErrorCode =
  | "UnsupportedContainer"
  | "UnsupportedCodec"
  | "MissingBrowserAPI"
  | "MissingExtension"
  | "FileTooLarge"
  | "DecodeFailed"
  | "EncodeFailed"
  | "OutOfMemory"
  | "AssetLoadFailed"
  | "Aborted";

export type MediaError = {
  code: MediaErrorCode;
  message: string;
  recoverable: boolean;
};
