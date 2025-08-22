import os
import re
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
def analyze_bacterial_response_single_heatmap_log(folder_path):

    print('\n=== Column Selection ===')
    print(f'Dataset folder: {folder_path}')
    receiver_column = int(input('Enter column number for receiver fluorescent intensity (1-based): ')) 
    producer_column = int(input('Enter column number for producer fluorescent intensity (1-based): '))

    all_data, conditions = process_folder(folder_path, receiver_column, producer_column)

    if all_data is None or len(all_data['frequency']) == 0:
        raise ValueError("Folder contains no valid data")

    create_single_heatmap_log(all_data, conditions, folder_path)
def process_folder(folder_path, receiver_column, producer_column):
    excel_files = [f for f in os.listdir(folder_path) if f.endswith('.xlsx')]
    if not excel_files:
        print(f'No Excel files found in folder: {folder_path}')
        return None, None

    xylose_concentrations = set()
    iptg_concentrations = set()
    pattern = r'Xylose(\w+)_([\w]+)IPTG_cropped_cell_info\.xlsx'

    for filename in excel_files:
        match = re.match(pattern, filename)
        if match:
            xylose_concentrations.add(match.group(1))
            iptg_concentrations.add(match.group(2))
        else:
            print(f'Filename {filename} does not match expected pattern')

    print(f'Found {len(xylose_concentrations)} xylose concentrations:', ', '.join(xylose_concentrations))
    print(f'Found {len(iptg_concentrations)} IPTG concentrations:', ', '.join(iptg_concentrations))

    all_frequency_data = []
    all_intensity_data = []
    conditions = []

    for xylose in xylose_concentrations:
        for iptg in iptg_concentrations:
            current_filename = f'Xylose{xylose}_{iptg}IPTG_cropped_cell_info.xlsx'
            full_path = os.path.join(folder_path, current_filename)
            if not os.path.exists(full_path):
                print(f'File {current_filename} not found, skipping...')
                continue
            df = pd.read_excel(full_path, engine='openpyxl')
            num_cols = df.shape[1]
            frames = df.iloc[:, 0].unique()
            x_coords = df.iloc[:, 1].values
            y_coords = df.iloc[:, 2].values
            cell_type = df.iloc[:, num_cols-1].values
            receiver_intensity = df.iloc[:, receiver_column].values
            receiver_cells = np.where(cell_type == 0)[0]
            sender_cells = np.where(cell_type == 1)[0]
            decay_constant = 3
            neighborhood_radius = decay_constant 

            for frame in frames:
                frame_indices = np.where(df.iloc[:, 0].values == frame)[0]
                receiver_cells_in_frame = np.intersect1d(receiver_cells, frame_indices)
                sender_cells_in_frame = np.intersect1d(sender_cells, frame_indices)
                if len(receiver_cells_in_frame) == 0:
                    continue

                sender_points = np.column_stack((x_coords[sender_cells_in_frame], y_coords[sender_cells_in_frame]))
                receiver_points = np.column_stack((x_coords[receiver_cells_in_frame], y_coords[receiver_cells_in_frame]))

                # Pairwise distances
                if sender_points.shape[0] > 0:
                    distances_sender_to_receiver = np.linalg.norm(sender_points[:, None, :] - receiver_points[None, :, :], axis=2)
                    exponential_weighted_senders = np.sum(np.exp(-distances_sender_to_receiver / neighborhood_radius), axis=0)
                else:
                    exponential_weighted_senders = np.zeros(receiver_points.shape[0])

                distances_receiver_to_receiver = np.linalg.norm(receiver_points[:, None, :] - receiver_points[None, :, :], axis=2)
                exponential_weighted_receivers = np.sum(np.exp(-distances_receiver_to_receiver / neighborhood_radius), axis=0)

                frequency = exponential_weighted_senders / (exponential_weighted_senders + exponential_weighted_receivers)
                intensity = receiver_intensity[receiver_cells_in_frame] 
                valid_indices = (frequency > 0) & (intensity > 0)
                if np.sum(valid_indices) > 0:
                    all_frequency_data.extend(frequency[valid_indices])
                    all_intensity_data.extend(intensity[valid_indices])

            conditions.append(f'Xylose{xylose}_IPTG{iptg}')
            print(f'Processed condition: Xylose {xylose}, IPTG {iptg}')

    return {'frequency': np.array(all_frequency_data), 'intensity': np.array(all_intensity_data)}, conditions
def create_single_heatmap_log(data, conditions, folder_path):
    print('\n=== Y-axis Limit Selection (Logarithmic Scale) ===')
    print(f'Dataset intensity range: {data["intensity"].min():.1f} to {data["intensity"].max():.1f}')
    y_limit_log = float(input('Enter Y-axis upper limit (e.g., 3.5 for 10^3.5): '))

    plt.rcParams.update({'font.size': 24,  'lines.linewidth': 2, 'axes.linewidth': 2})

    plt.figure(figsize=(12,9))
    print(f'Using logarithmic Y-limit: 10^{y_limit_log:.1f}')

    n_bins_x = 60
    n_bins_y = 60
    x_edges = np.logspace(np.log10(0.01), np.log10(1), n_bins_x + 1)
    y_edges = np.logspace(np.log10(10**1), np.log10(10**y_limit_log), n_bins_y + 1)
    x_centers = np.sqrt(x_edges[:-1] * x_edges[1:])
    y_centers = np.sqrt(y_edges[:-1] * y_edges[1:])

    N, _, _ = np.histogram2d(data['frequency'], data['intensity']*20, bins=[x_edges, y_edges])

    # Normalize column-wise (each X-bin)
    N_normalized = np.zeros_like(N)
    for col in range(N.shape[0]):
        max_val = N[col, :].max()
        if max_val > 0:
            N_normalized[col, :] = N[col, :] / max_val

    from matplotlib.colors import LogNorm
    plt.imshow(N_normalized.T, extent=[x_edges[0], x_edges[-1], y_edges[0], y_edges[-1]],
            aspect='auto', origin='lower', cmap='viridis')


    """ plt.xscale('log')
    plt.yscale('log') """
    plt.xlim(0.01, 1)
    plt.ylim(0, 10**y_limit_log)
    #plt.xticks([0.01, 0.032, 0.1, 0.32, 1.0], ['0.01', '0.032', '0.1', '0.32', '1.0'])
    plt.xlabel('Non-Reporter Frequency')
    plt.ylabel('FP Intensity (a.u.)')
    cbar = plt.colorbar()
    cbar.set_label('Relative Density per Frequency Bin')
    cbar.ax.tick_params(labelsize=22)
    plt.grid(alpha=0.3)
    plt.box(True)
    plt.tick_params(direction='out', length=8)
    plt.tight_layout()

    folder_name = os.path.basename(folder_path)
    filename = f'SingleHeatmapLog_Poster_{folder_name}.png'
    plt.savefig(filename, dpi=600)
    print(f'Saved poster-ready single logarithmic heatmap: {filename}')
    plt.show()
if __name__ == '__main__':
    folder_path = input('Enter the path to the folder containing Excel files: ')
    analyze_bacterial_response_single_heatmap_log(folder_path)
