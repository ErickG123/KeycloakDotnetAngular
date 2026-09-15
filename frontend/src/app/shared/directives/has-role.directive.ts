import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private keycloak = inject(KeycloakService);

  @Input('hasRole') requiredRole!: string;

  ngOnInit(): void {
    const userRoles = this.keycloak.getUserRoles();
    if (userRoles.includes(this.requiredRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
