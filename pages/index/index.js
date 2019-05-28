Page({
    data: {
        /** 图片列表 */
        imgList: []
    },
    /** 清除当前图片 */
    removeImg(e) {
        let index = e.currentTarget.dataset.index;
        console.log(index);
        let list = this.data.imgList;
        list.splice(index, 1);
        this.setData({
            imgList: list
        });
    },

    /** 上传图片 */
    chooseImage() {
        const THAT = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],  //可选择原图或压缩后的图片
            sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
            success(res) {
                let image = res.tempFilePaths[0];
                /** 获取组件方法 */
                THAT.selectComponent("#cutProImage").selectPic(image);
            }
        });
    },

    /** 裁截图片 */
    cutImg(e) {
        let img = e.detail.path;
        console.log('裁截图片', img);
        let list = this.data.imgList;
        list.push(img);
        this.setData({
            imgList: list
        });
        
    },

    onLoad() {
        
    },
})