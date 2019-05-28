// components/cut-img/cutimg.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        /** 裁剪之后图片宽度 */
        picWidth: {
            type: Number,
            value: 300
        },
        /** 裁剪之后图片高度 */
        picHeight: {
            type: Number,
            value: 300
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        startX: null,
        startY: null,
        bigTop: null,
        bigLeft: null,
        smallTop: null,
        smallLeft: null,
        width: '0',
        height: '0',
        top: '0',
        left: '0',
        startTop: 0,
        startLeft: 0,
        src: '',
        showPicBox: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
        selectPic(res) {
            const THAT = this;
            this.setData({
                showPicBox: true,
                src: res
            });
            wx.getImageInfo({
                src: res,
                success(picture) {
                    /** 图片的宽高比 */
                    let value = picture.width / picture.height;
                    /** 视口宽度 */
                    let window_width = wx.getSystemInfoSync().windowWidth / 750 * 600;
                    if (value > 1) {
                        THAT.startImageTop = - window_width / 2;
                        THAT.startImageLeft = - value * window_width / 2;
                        THAT.setData({
                            height: window_width,
                            width: value * window_width,
                            top: - window_width / 2,
                            left: - value * window_width / 2,
                            smallTop: - window_width / 2,
                            bigTop: - window_width / 2,
                            smallLeft: - value * window_width / 2 - (value * window_width - window_width) / 2,
                            bigLeft: - window_width / 2
                        })
                    } else {
                        THAT.startImageTop = - window_width / value / 2;
                        THAT.startImageLeft = - window_width / 2;
                        THAT.setData({
                            width: window_width,
                            height: window_width / value,
                            top: - window_width / value / 2,
                            left: - window_width / 2,
                            smallTop: - window_width / value / 2 - (window_width / value - window_width) / 2,
                            bigTop: - window_width / 2,
                            smallLeft: - window_width / 2,
                            bigLeft: - window_width / 2
                        });
                    }
                }
            });
        },

        /** 开始触摸 */
        moveStart(e) {
            if (e.touches.length == 1) {
                this.setData({
                    startTop: this.data.top,
                    startLeft: this.data.left,
                    startX: this.data.startX || e.touches[0].clientX,
                    startY: this.data.startY || e.touches[0].clientY
                });
            }
        },

        /** 触摸移动 */
        moveTouch(e) {
            if (e.touches.length == 1) {
                let xMove = (e.touches[0].clientX - this.data.startX);
                let yMove = (e.touches[0].clientY - this.data.startY);
                this.setData({
                    top: this.data.startTop + yMove > this.data.smallTop ? (this.data.startTop + yMove <= this.data.bigTop ? this.data.startTop + yMove : this.data.bigTop) : this.data.smallTop,
                    left: this.data.startLeft + xMove > this.data.smallLeft ? (this.data.startLeft + xMove <= this.data.bigLeft ? this.data.startLeft + xMove : this.data.bigLeft) : this.data.smallLeft
                });
            }
        },

        /** 触摸结束 */
        endTouch(e) {
            this.setData({
                startY: null,
                startX: null
            });
        },

        /** 重置位置 */
        canvasReset() {
            this.setData({
                top: this.startImageTop,
                left: this.startImageLeft
            });
        },

        /** 关闭当前插件 */
        canvasCancel() {
            this.setData({
                showPicBox: false
            });
        },

        /** 确认 */
        canvasSubmit() {
            this.createNewImg();
        },

        /** 获取canvas尺寸 */
        setCanvasSize() {
            let size = {};
            size.w = this.data.picWidth;
            size.h = this.data.picHeight;
            return size;
        },

        /** 创建canvas */
        createNewImg() {
            const THAT = this;
            /** canvas属性 */
            let context = wx.createCanvasContext('cutCanvas');
            /** 绘制的 canvas 图片路径 */
            let src = this.data.src;
            /** canvas 尺寸 */
            let size = this.setCanvasSize();
            // console.log('canvas', size);
            /** 视口宽度 */
            let window_width = wx.getSystemInfoSync().windowWidth / 750 * 600;
            // console.log('视口宽度', window_width);
            /** 源图像的矩形选择框的左上角 x 坐标 */
            let sx = (this.data.left / window_width * size.w) + size.w / 2;
            // console.log('sx', sx);
            /** 源图像的矩形选择框的左上角 y 坐标 */
            let sy = (this.data.top / window_width * size.w) + size.h / 2;
            // console.log('sy', sy);
            /** 源图像的矩形选择框的宽度 */
            let sWidth = this.data.width / window_width * size.w;
            // console.log('sWidth', sWidth);
            /** 源图像的矩形选择框的高度 */
            let sHeight = this.data.height / window_width * size.h;
            // console.log('sHeight', sHeight);
            // console.log('context', context);
            context.drawImage(src, sx, sy, sWidth, sHeight);
            context.draw(false, function() {
                // console.log('执行');
                wx.canvasToTempFilePath({
                    canvasId: 'cutCanvas',
                    quality: 1,
                    // fileType: "png",
                    success(res) {
                        let tempFilePath = res.tempFilePath;
                        THAT.setData({
                            showPicBox: false
                        }, function () {
                            let obj = { "path": tempFilePath }
                            THAT.triggerEvent('getFilePath', obj);
                        });
                    },
                    fail(res) {
                        console.log(res);
                    }
                });
            });
        }
    }
});
