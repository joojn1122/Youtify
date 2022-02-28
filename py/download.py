# coding=UTF-8
import os
import youtube_dl
import sys

#link = sys.argv[1]
#path = sys.argv[2]
link = "https://www.youtube.com/watch?v=gDwVGS75sUA"
path = os.getcwd() + "\\"

def run():
    video_url = link
    video_info = youtube_dl.YoutubeDL().extract_info(
        url = video_url,download=False
    )
    filename = f"{video_info['title']}.mp3"
    options={
        'format':'bestaudio/best',
        'keepvideo':False,
        'outtmpl': path + "\\" + filename,
        'quiet': True,
        'postprocessor_args': ['-loglevel', 'panic']
    }

    with youtube_dl.YoutubeDL(options) as ydl:
        ydl.download([video_info['webpage_url']])

    print(filename)

run()