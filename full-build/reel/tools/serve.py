#!/usr/bin/env python3
"""Local static server with HTTP Range (needed for video seek)."""
import os, sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class RangeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.translate_path(self.path.split("?",1)[0])
        if os.path.isdir(path):
            return super().send_head()
        if not os.path.isfile(path):
            self.send_error(404, "File not found")
            return None
        ctype = self.guess_type(path)
        try:
            fs = os.stat(path)
        except OSError:
            self.send_error(404, "File not found")
            return None
        size = fs.st_size
        start, end = 0, size - 1
        rng = self.headers.get("Range")
        partial = False
        if rng and rng.startswith("bytes="):
            spec = rng.split("=", 1)[1].split(",")[0].strip()
            a, _, b = spec.partition("-")
            try:
                if a != "":
                    start = int(a)
                if b != "":
                    end = int(b)
            except ValueError:
                start, end = 0, size - 1
            if start < 0:
                start = 0
            if end >= size:
                end = size - 1
            if start > end:
                self.send_error(416, "Requested range not satisfiable")
                return None
            partial = True
        if partial:
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.send_header("Cache-Control", "public, max-age=120")
        self.end_headers()
        f = open(path, "rb")
        if start:
            f.seek(start)
        self._range_len = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_len", None)
        if remaining is None:
            super().copyfile(source, outputfile)
            return
        try:
            del self._range_len
        except Exception:
            pass
        while remaining:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            try:
                outputfile.write(chunk)
            except BrokenPipeError:
                break
            remaining -= len(chunk)

    def log_message(self, fmt, *args):
        return

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8879
    httpd = ThreadingHTTPServer(("127.0.0.1", port), RangeHandler)
    print(f"serving {ROOT} on http://127.0.0.1:{port}/", flush=True)
    httpd.serve_forever()
