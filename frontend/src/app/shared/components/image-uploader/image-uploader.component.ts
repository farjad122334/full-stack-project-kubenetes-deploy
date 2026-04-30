import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-image-uploader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './image-uploader.component.html',
    styleUrls: ['./image-uploader.component.css']
})
export class ImageUploaderComponent {
    @Input() multiple = true;
    @Input() existingImages: any[] = [];
    @Output() imagesSelected = new EventEmitter<File[]>();
    @Output() imageDeleted = new EventEmitter<number>();
    @Output() imageClicked = new EventEmitter<string>();

    selectedFiles: File[] = [];
    previews: string[] = [];

    constructor(private cdr: ChangeDetectorRef) { }

    onFilesSelected(event: any): void {
        const files = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.match(/image\/*/) == null) {
                    continue;
                }

                this.selectedFiles.push(file);

                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.previews.push(e.target.result);
                    this.cdr.detectChanges(); // Force update
                };
                reader.readAsDataURL(file);
            }
            this.imagesSelected.emit(this.selectedFiles);
        }
        // Clear input so change event fires if same file selected again
        event.target.value = '';
    }

    removeNewImage(index: number): void {
        this.selectedFiles.splice(index, 1);
        this.previews.splice(index, 1);
        this.imagesSelected.emit(this.selectedFiles);
    }

    removeExistingImage(imageId: number): void {
        this.imageDeleted.emit(imageId);
    }

    onImageClick(url: string): void {
        this.imageClicked.emit(url);
    }
}
