export interface ConfirmDialogConfig {
    title: string;
    message: string;
    nameButton?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    hideActions?: boolean;
    hideClose?: boolean;
    modalType?: number; // 0: default, 1: ovalado
    icon?: string;
    colorModalType?: number; // 1: default, 2: white
    valueY?: number; // Vertical position offset
    valueX?: number; // Horizontal position offset
}
