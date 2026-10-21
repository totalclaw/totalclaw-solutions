# 古兰经智能教学演示 · 内置阿拉伯文经文字体

- `AmiriQuran.ttf`：Amiri Quran 1.001（奥斯曼体经文专用，含全部诵读符号）
- `Amiri-Regular.ttf`：Amiri 1.001（阿文正文 / 界面阿文）
- 来源：https://github.com/aliftype/amiri（Khaled Hosny）
- 许可：SIL Open Font License 1.1，见同目录 `OFL.txt`。允许随软件打包分发与嵌入；不得单独出售、保留字体名称。

随包路径：`<resources>/quran-demo-fonts/`（electron-builder extraResources）。渲染层经 `totalclaw-media://` 以 @font-face 加载；
主进程离屏渲染（卡片 / 分镜）把字体以 base64 内嵌进 HTML，Windows 上不再回落到 serif。
