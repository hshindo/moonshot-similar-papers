FROM python:3.11-slim

# ENV LANG C.UTF-8
# ENV PATH=/app/bin:$PATH
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

RUN pip install fastapi uvicorn

COPY ./app ./app
WORKDIR ./app
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8080"]