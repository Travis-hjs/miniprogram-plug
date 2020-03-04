// components/cut-img/cutimg.js
Component({
    
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

    data: {
        startX: 0,
        startY: 0,
        bigTop: 0,
        bigLeft: 0,
        smallTop: 0,
        smallLeft: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        startTop: 0,
        startLeft: 0,
        src: '',
        showPicBox: false
    },

    methods: {
        /**
         * 选择图片
         * @param {string} path 图片路径
         */
        selectPic(path) {
            const THAT = this;
            this.setData({
                showPicBox: true,
                src: path
            });
            wx.getImageInfo({
                src: path,
                success(picture) {
                    /** 图片的宽高比 */
                    const value = picture.width / picture.height;
                    /** 视口宽度 */
                    const view_width = wx.getSystemInfoSync().windowWidth / 750 * 600;
                    if (value > 1) {
                        THAT['startImageTop'] = - view_width / 2;
                        THAT['startImageLeft'] = - value * view_width / 2;
                        THAT.setData({
                            height: view_width,
                            width: value * view_width,
                            top: - view_width / 2,
                            left: - value * view_width / 2,
                            smallTop: - view_width / 2,
                            bigTop: - view_width / 2,
                            smallLeft: - value * view_width / 2 - (value * view_width - view_width) / 2,
                            bigLeft: - view_width / 2
                        })
                    } else {
                        THAT['startImageTop'] = - view_width / value / 2;
                        THAT['startImageLeft'] = - view_width / 2;
                        THAT.setData({
                            width: view_width,
                            height: view_width / value,
                            top: - view_width / value / 2,
                            left: - view_width / 2,
                            smallTop: - view_width / value / 2 - (view_width / value - view_width) / 2,
                            bigTop: - view_width / 2,
                            smallLeft: - view_width / 2,
                            bigLeft: - view_width / 2
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
                startY: 0,
                startX: 0
            });
        },

        /** 重置位置 */
        canvasReset() {
            this.setData({
                top: this['startImageTop'],
                left: this['startImageLeft']
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
            return {
                /** @type {number} */
                w: this.data.picWidth,
                /** @type {number} */
                h: this.data.picHeight
            };
        },

        /** 创建canvas */
        createNewImg() {
            const THAT = this;
            /** canvas属性 */
            const context = wx.createCanvasContext('cutCanvas');
            /** 绘制的 canvas 图片路径 */
            const src = this.data.src;
            /** canvas 尺寸 */
            const size = this.setCanvasSize();
            // console.log('canvas', size);
            /** 视口宽度 */
            const view_width = wx.getSystemInfoSync().windowWidth / 750 * 600;
            // console.log('视口宽度', view_width);
            /** 源图像的矩形选择框的左上角 x 坐标 */
            const sx = (this.data.left / view_width * size.w) + size.w / 2;
            // console.log('sx', sx);
            /** 源图像的矩形选择框的左上角 y 坐标 */
            const sy = (this.data.top / view_width * size.w) + size.h / 2;
            // console.log('sy', sy);
            /** 源图像的矩形选择框的宽度 */
            const sWidth = this.data.width / view_width * size.w;
            // console.log('sWidth', sWidth);
            /** 源图像的矩形选择框的高度 */
            const sHeight = this.data.height / view_width * size.h;
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
                        THAT.setData({
                            showPicBox: false
                        }, function () {
                            THAT.triggerEvent('getFilePath', { 'path': res.tempFilePath });
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
