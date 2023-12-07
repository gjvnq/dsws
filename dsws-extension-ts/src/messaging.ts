interface DswsMessage {
    dsws_type: string;
}

interface OpenDswsFileRequest extends DswsMessage {
    dsws_type: "open_dsws_file_request";
    file: File;
}

interface OpenDswsFileReply extends DswsMessage {
    dsws_type: "open_dsws_file_reply";
    status: string;
    ready: boolean;
}

interface ListSavedDswsFilesRequest extends DswsMessage {
    dsws_type: "list_saved_dsws_files_request";
}

interface ListSavedDswsFilesReply extends DswsMessage {
    dsws_type: "list_saved_dsws_files_reply";
    filenames: string[];
}