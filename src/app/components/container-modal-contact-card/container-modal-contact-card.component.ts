import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ContainerModalCardService } from '../../core/services/container-modal-card.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/shared/dialog.service';

@Component({
  selector: 'app-container-modal-contact-card',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './container-modal-contact-card.component.html',
  styleUrl: './container-modal-contact-card.component.less'
})
export class ContainerModalContactCardComponent implements OnInit {

  public containerModalCardService = inject(ContainerModalCardService);
  private readonly fb = inject(FormBuilder);
  private readonly dialogService = inject(DialogService);

  contactForm!: FormGroup;
  isSubmitted = signal(false);

  constructor() {
    // Usamos un effect para actualizar el mensaje si la propiedad cambia
    effect(() => {
      const property = this.containerModalCardService.selectedProperty();
      if (property && this.contactForm) {
        this.contactForm.patchValue({
          mensaje: `Hola, estoy interesado en la propiedad ubicada en ${property.address}. Por favor, contáctenme.`
        });
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      mensaje: ['', [Validators.required]]
    });
  }

  sendForm(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      const propertyId = this.containerModalCardService.selectedProperty()?.id;
      this.isSubmitted.set(true);

      console.log('Enviando datos de contacto:', { ...formData, propertyId });
      // Limpiar y cerrar
      this.contactForm.reset();
      // this.containerModalCardService.closeContactForm();
    }
  }
}
