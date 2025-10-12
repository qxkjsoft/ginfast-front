declare module 'vue-cropper' {
    import { DefineComponent } from 'vue'

    interface VueCropperProps {
        img?: string
        outputType?: string
        outputSize?: number
        info?: boolean
        canScale?: boolean
        autoCrop?: boolean
        autoCropWidth?: number
        autoCropHeight?: number
        fixed?: boolean
        fixedNumber?: number[]
        fixedBox?: boolean
        full?: boolean
        canMove?: boolean
        canMoveBox?: boolean
        original?: boolean
        centerBox?: boolean
        high?: boolean
        infoTrue?: boolean
        maxImgSize?: number
        enlarge?: number
        mode?: string
        limitMinSize?: number | number[]
    }

    interface VueCropperMethods {
        startCrop(): void
        stopCrop(): void
        clearCrop(): void
        changeScale(num: number): void
        getImgAxis(): { x1: number; x2: number; y1: number; y2: number }
        getCropAxis(): { x1: number; x2: number; y1: number; y2: number }
        getImgInfo(): any
        getCropInfo(): any
        getCropBlob(cb: (blob: Blob) => void): void
        getCropData(cb: (data: string) => void): void
    }

    type VueCropper = DefineComponent<VueCropperProps, {}, {}, {}, VueCropperMethods>

    export const VueCropper: VueCropper
}