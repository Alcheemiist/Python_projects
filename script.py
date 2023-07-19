import pandas as pd
import os

def read_and_extract_data(file_path, column_name, idud):
    df = pd.read_csv(file_path, encoding='ISO-8859-1')
    index = ""
    j = -1
    for i in df.columns:
        if (i.__contains__(column_name)):
            index = i
            j+= 1
            break
    selected_row = df.loc[j]
    return selected_row

def main():
    directory_path = './match_csv/'
    idud = "51015"
    output_file_path = './record__['+ idud+ '].xlsx'
    file_list = os.listdir(directory_path)
    extracted_data = []
    for file_name in file_list:
        file_path = os.path.join(directory_path, file_name)
        column_name = '_PIDM'
        data = read_and_extract_data(file_path, column_name, idud)
        extracted_data.append(data)
    merged_data = pd.concat(extracted_data, ignore_index=False)
    with pd.ExcelWriter(output_file_path) as writer:
        merged_data.to_excel(writer, index=True, sheet_name='FilteredData')

#-----------------------------------------------------------------------
#-----------------------------------------------------------------------



if __name__ == "__main__":
    main()
