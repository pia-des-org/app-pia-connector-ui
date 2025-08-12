import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AppConfigService } from "./app-config.service";
import { CertificateService } from "./components/services/certificate.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Property to store certificate information
  certificateDN: string | null = null;
  organizationName: string | null = null;

  constructor(
    private router: Router,
    private titleService: Title,
    private configService: AppConfigService,
    private certificateService: CertificateService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    const appTitle = this.titleService.getTitle();
    this.router
      .events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const child = this.activatedRoute.firstChild;
          if (child?.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return appTitle;
        })
      ).subscribe((title: string) => {
        this.titleService.setTitle(title);
      });

    // Fetch certificate information from backend (/me) and update fields when available
    this.certificateService.fetchCertificateInfo().subscribe({
      next: (dn) => {
        this.certificateDN = dn;
        this.organizationName = this.certificateService.getOrganizationFromCertificate();
      },
      error: () => {
        // already logged in service; keep values as null
      }
    });
  }

  /**
   * Checks if a valid certificate is present
   * @returns True if a certificate is present, false otherwise
   */
  hasCertificate(): boolean {
    return this.certificateService.hasCertificate();
  }

  themeClass(): string | undefined {
    return this.configService.getConfig()?.theme;
  }
}
