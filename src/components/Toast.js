// Utility class for showing toast notifications using NiceAdmin's built-in toast
export class Toast {
  static show(message, type = 'info') {
    Toast.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    document.getElementById('toast-container').appendChild(toast);

    // Wait for Bootstrap to be available
    const showToast = () => {
      if (window.bootstrap) {
        const bsToast = new window.bootstrap.Toast(toast);
        bsToast.show();

        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
          toast.remove();
        });
      } else {
        // If Bootstrap is not loaded yet, wait and try again
        setTimeout(showToast, 100);
      }
    };

    showToast();
  }

  static success(message) {
    this.show(message, 'success');
  }

  static error(message) {
    this.show(message, 'danger');
  }

  static warning(message) {
    this.show(message, 'warning');
  }

  static info(message) {
    this.show(message, 'info');
  }

  static createToastContainer() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '1060';
      document.body.appendChild(container);
    }
  }
}
